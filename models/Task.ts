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
    if (this.repeats.period == "Daily") {
      if (
        this.repeats.specific_days &&
        this.repeats.specific_days.includes(date.getDate())
      )
        return true;
      if (
        this.repeats.every_n &&
        differenceInDays(this.startsOn, date) % this.repeats.every_n == 0
      )
        return true;
      if (
        this.repeats.specific_weekday &&
        this.repeats.specific_weekday.includes(date.getDay())
      )
        return true;
    } else if (this.repeats.period == "Weekly") {
      if (
        this.repeats.every_n &&
        differenceInCalendarWeeks(date, this.startsOn) % this.repeats.every_n ==
          0
      )
        return true;
    } else if (this.repeats.period == "Monthly") {
      if (
        this.repeats.every_n &&
        differenceInCalendarMonths(date, this.startsOn) %
          this.repeats.every_n ==
          0
      )
        return true;
    }
    return false;
  }
  //Starting from a valid date go to the nth next date

  getStreak(date: Date): number {
    let streak = 0;
    let current = date;
    if (this.repeats.period == "Daily") {
      current = startOfDay(date);
    } else if (this.repeats.period == "Weekly") {
      current = startOfWeek(date);
    } else {
      log.debug("Unsupported period");
      throw new Error("Unsupported period");
    }
    return 0;
  }

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
      period: "Daily",
      specific_weekday: [0, 1, 2, 3, 4, 5, 6],
      every_n: 1,
    } as Repeats,
    goal: {
      amount: 1,
      steps: 1,
      unit: "count",
    } as Goal,
  } as EditableTask;
}

interface Repeats {
  period: string;
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
