import { Model, Q, Query, Relation } from "@nozbe/watermelondb";
import {
  date,
  immutableRelation,
  readonly,
  text,
  json,
  children,
  lazy,
  writer,
} from "@nozbe/watermelondb/decorators";

import { CALENDAR, TableName } from "./schema";
import {
  addDays,
  addMonths,
  differenceInCalendarMonths,
  differenceInCalendarWeeks,
  differenceInDays,
  endOfDay,
  endOfWeek,
  getDay,
  isSameDay,
  isSameWeek,
  startOfDay,
  startOfWeek,
  subDays,
  subWeeks,
} from "date-fns";
import { SWATCHES_COLORS } from "~/components/Task/EditTaskScreen/SelectColor";
import { log } from "~/lib/config";
import { CompletedResult } from "~/models/CompletedResult";

export interface EditableTask {
  startsOn: Date;
  title: string;
  description: string;
  color: string;
  repeats: Repeats;
  goal: Goal;
}

export class Task extends Model {
  static table = TableName.TASKS;
  static associations = {
    [TableName.COMPLETED_RESULT]: {
      type: "has_many" as const,
      foreignKey: "task_id",
    },
  };
  @readonly @date("created_at") createdAt!: Date;
  @date("starts_on") startsOn!: Date;
  @date("ends_on") endsOn?: Date;
  @text("title") title!: string;
  @text("description") description!: string;
  @text("icon") icon!: string;
  @text("color") color!: string;

  @json("repeats", (json) => json) repeats!: Repeats;
  @json("goal", (json) => json) goal!: Goal;

  @lazy completed = this.collections
    .get<CompletedResult>(TableName.COMPLETED_RESULT)

    .query(Q.where("task_id", this.id));
  @lazy sortedCompleted = this.completed.extend(
    Q.sortBy("completed_at", Q.desc)
  );
  toEditableTask(): EditableTask {
    return {
      startsOn: this.startsOn,
      title: this.title,
      description: this.description,
      color: this.color,
      repeats: this.repeats,
      goal: this.goal,
    };
  }
  showToday(date: Date): boolean {
    if (date < this.startsOn || (this.endsOn && date > this.endsOn)) {
      return false;
    }
    switch (this.repeats.period) {
      case Period.Daily:
        if (
          this.repeats.selected_frequency == Frequency.specific_weekday &&
          this.repeats.specific_weekday.includes(date.getDay())
        ) {
          return true;
        }
        return (
          this.repeats.selected_frequency == Frequency.every_n &&
          differenceInDays(date, this.startsOn) % this.repeats.every_n == 0
        );
      case Period.Weekly:
        return (
          this.repeats.selected_frequency == Frequency.every_n &&
          differenceInDays(date, this.startsOn) % (this.repeats.every_n * 7) ==
            0
        );

      case Period.Monthly:
        if (
          this.repeats.selected_frequency == Frequency.every_n &&
          differenceInCalendarMonths(date, this.startsOn) %
            this.repeats.every_n ==
            0
        ) {
          return true;
        }
        return this.repeats.specific_days.includes(date.getDate());
      default:
        return false;
    }
  }
  //Starting from a valid date go to the nth next date

  getCompleted(date: Date): Query<CompletedResult> {
    let beginning: Date;
    let end: Date;
    if (this.repeats.period == "Daily") {
      beginning = startOfDay(date);
      end = endOfDay(date);
    } else if (this.repeats.period == "Weekly") {
      beginning = startOfWeek(date);
      end = endOfWeek(date);
    } else {
      log.debug("Unsupported period");
      throw new Error("Unsupported period");
    }
    return this.sortedCompleted
      .extend(
        Q.and(
          Q.where("completed_at", Q.gte(beginning.getTime())),
          Q.where("completed_at", Q.lte(end.getTime()))
        )
      )
      .extend(Q.take(1));
  }
  @writer async skip(date: Date) {
    let completed = await this.getCompleted(date).fetch();
    if (completed.length == 0) {
      await this.collections
        .get<CompletedResult>(TableName.COMPLETED_RESULT)
        .create((completed) => {
          completed.completed_at = date;
          completed.completed_times = [];
          completed.task.set(this);
          completed.goal = this.goal;
          completed.total = 0;
          completed.skipped = true;
        });
    } else {
      await this.callWriter(() => completed[0].skip());
    }
  }
  @writer async createCompleted(date: Date) {
    let completed = await this.collections
      .get<CompletedResult>(TableName.COMPLETED_RESULT)
      .create((completed) => {
        completed.completed_at = date;
        completed.completed_times = [
          {
            date: date.getTime(),
            amount: this.goal.steps,
          },
        ];
        completed.task.set(this);
        completed.goal = this.goal;
        completed.total = 0;
      });
    await this.callWriter(() => completed.complete(date));
  }

  @writer async endTask(date: Date) {
    await this.update(() => {
      this.endsOn = date;
    });
  }

  markAsDeleted(): Promise<void> {
    this.completed.markAllAsDeleted();
    return super.markAsDeleted();
  }
}

export function getNextDate(repeats: Repeats, currentDate: Date): Date {
  let nextDate = new Date(currentDate);

  switch (repeats.period) {
    case Period.Daily:
      if (repeats.selected_frequency == Frequency.specific_weekday) {
        const currentDay = currentDate.getDay(); // 0 (Sunday) - 6 (Saturday)
        const nextWeekdays = repeats.specific_weekday
          .map((day) => (day > currentDay ? day : day + 7))
          .sort((a, b) => a - b);

        nextDate.setDate(
          currentDate.getDate() + (nextWeekdays[0] - currentDay)
        );
      } else if (repeats.selected_frequency == Frequency.every_n) {
        nextDate = addDays(nextDate, repeats.every_n);
      }
      break;

    case Period.Weekly:
      if (repeats.selected_frequency == Frequency.every_n) {
        nextDate = addDays(nextDate, repeats.every_n * 7);
      } else {
        throw new Error("Invalid frequency");
      }
      break;

    case Period.Monthly:
      if (repeats.selected_frequency == Frequency.specific_days) {
        const currentMonthDay = currentDate.getDate();
        const nextMonthDays = repeats.specific_days
          .filter((day) => day > currentMonthDay)
          .sort((a, b) => a - b);

        if (nextMonthDays.length > 0) {
          nextDate.setDate(nextMonthDays[0]);
        } else {
          nextDate.setMonth(nextDate.getMonth() + repeats.every_n);
          nextDate.setDate(repeats.specific_days[0]);
        }
      } else if (repeats.selected_frequency == Frequency.every_n) {
        nextDate = addMonths(nextDate, repeats.every_n);
      } else {
        throw new Error("Invalid frequency");
      }
      break;

    default:
      throw new Error("Invalid period");
  }

  return nextDate;
}

export function repeatsToString(goal: Goal, repeats: Repeats) {
  let prefix = "";
  if (repeats.period == "Daily") {
    if (repeats.specific_weekday) {
      prefix += `Every ${repeats.specific_weekday
        .map((a) => CALENDAR[a])
        .join(", ")} `;
    } else if (repeats.every_n) {
      prefix += `Every ${repeats.every_n} days `;
    }
  } else if (repeats.period == "Weekly") {
    if (repeats.every_n) {
      prefix += `Every ${repeats.every_n} weeks `;
    }
  } else if (repeats.period == "Monthly") {
  } else {
  }

  prefix += `for ${goal.amount} ${goal.unit}`;
  return prefix;
}

function getRandomBrightColor(): string {
  return SWATCHES_COLORS[Math.floor(Math.random() * SWATCHES_COLORS.length)];
}
export function GenerateTask(): EditableTask {
  return {
    title: "New Task",
    description: "",
    createdAt: new Date(Date.now()),
    startsOn: startOfDay(new Date(Date.now())),
    color: getRandomBrightColor(),
    repeats: {
      period: Period.Daily,
      specific_weekday: [] as number[],
      every_n: 1,
      selected_frequency: Frequency.every_n,
    } as Repeats,
    goal: {
      amount: 1,
      steps: 1,
      unit: "count",
    } as Goal,
  } as EditableTask;
}

export enum Period {
  Daily = "Daily",
  Weekly = "Weekly",
  Monthly = "Monthly",
}

export enum Frequency {
  specific_weekday = "specific_weekday",
  specific_days = "specific_days",
  every_n = "every_n",
}

interface Repeats {
  period: Period;
  selected_frequency: Frequency;
  specific_weekday: number[];
  specific_days: number[];
  every_n: number;
}

export interface Goal {
  amount: number;
  unit: string;
  steps: number;
  customName?: string;
}

interface Analytics {
  streaks: { dates: Date[] }[];
}
