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

import { TableName } from "./schema";
import { Completed } from "~/models/Completed";
import {
  differenceInCalendarMonths,
  differenceInCalendarWeeks,
  differenceInDays,
  endOfDay,
  endOfWeek,
  isSameDay,
  isSameWeek,
  startOfDay,
  startOfWeek,
} from "date-fns";
import { SWATCHES_COLORS } from "~/components/Task/EditTaskScreen";
import { log } from "~/lib/config";

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
    [TableName.COMPLETED]: {
      type: "has_many" as const,
      foreignKey: "task_id",
    },
  };
  @readonly @date("created_at") createdAt!: Date;
  @date("starts_on") startsOn!: Date;
  @date("ends_on") endsOn?: Date;
  @text("title") title!: string;
  @text("description") description!: string;
  @text("color") color!: string;
  @json("repeats", (json) => json) repeats!: Repeats;
  @json("goal", (json) => json) goal!: Goal;

  @lazy completed = this.collections
    .get<Completed>(TableName.COMPLETED)
    .query(Q.where("task_id", this.id));
  @lazy sortedCompleted = this.completed.extend(
    Q.sortBy("completed_on", Q.desc)
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

  checkCompleted(completedArray: Completed[]): CompletedResult {
    let total = 0;
    for (let i = 0; i < completedArray.length; i++) {
      total += completedArray[i].amount;
    }
    return {
      completed: completedArray,
      isCompleted: total >= this.goal.amount,
      total: total,
    };
  }
  getCompleted(date: Date): Query<Completed> {
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
    return this.sortedCompleted.extend(
      Q.and(
        Q.where("completed_on", Q.gte(beginning.getTime())),
        Q.where("completed_on", Q.lte(end.getTime()))
      )
    );
  }
  @writer async createCompleted(date: Date) {
    await this.collections
      .get<Completed>(TableName.COMPLETED)
      .create((completed) => {
        completed.amount = this.goal.steps;
        completed.completedOn = date;
        completed.task.set(this);
      });
  }

  markAsDeleted(): Promise<void> {
    this.completed.markAllAsDeleted();
    return super.markAsDeleted();
  }
}

export interface CompletedResult {
  completed: Completed[];
  isCompleted: boolean;
  total: number;
}

function getRandomBrightColor(): string {
  return SWATCHES_COLORS[Math.floor(Math.random() * SWATCHES_COLORS.length)];
}
export function GenerateTask(): EditableTask {
  return {
    title: "New Task",
    description: "",
    createdAt: new Date(Date.now()),
    startsOn: new Date(Date.now()),
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
