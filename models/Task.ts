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
  isSameDay,
  isSameWeek,
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
  @text("title") title!: string;
  @text("description") description!: string;
  @text("color") color!: string;
  @json("repeats", (json) => json) repeats!: Repeats;
  @json("goal", (json) => json) goal!: Goal;

  @lazy completed = this.collections
    .get<Completed>(TableName.COMPLETED)
    .query(Q.where("task_id", this.id));
  @lazy sortedCompleted = this.completed.extend(Q.sortBy("created_at", Q.desc));
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
    if (date < this.startsOn) {
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
  async getCompleted(date: Date): Promise<Completed | undefined> {
    const completed = await this.sortedCompleted.fetch();

    if (this.repeats.period == "Weekly") {
      for (let i = completed.length - 1; i >= 0; i--) {
        if (isSameWeek(completed[i].createdAt, date)) return completed[i];
      }
    }
    if (this.repeats.period == "Daily") {
      for (let i = completed.length - 1; i >= 0; i--) {
        if (isSameDay(completed[i].createdAt, date)) return completed[i];
      }
    }
  }
  @writer async createCompleted(date: Date) {
    await this.collections
      .get<Completed>(TableName.COMPLETED)
      .create((completed) => {
        completed.amount = this.goal.steps;
        completed.goal = this.goal;
        completed.createdAt = date;
        completed.task.set(this);
      });
  }
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
