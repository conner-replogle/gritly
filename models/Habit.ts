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
import { log } from "~/lib/config";
import { Completed } from "~/models/Completed";
import { Frequency, Goal, Period, Repeats } from "~/lib/types";

export interface EditableHabit {
  startsOn: Date;
  title: string;
  description: string;
  color: string;
  repeats: Repeats;
  goal: Goal;
}

export class Habit extends Model {
  static table = TableName.HABITS;
  static associations = {
    [TableName.COMPLETED]: {
      type: "has_many" as const,
      foreignKey: "habit_id",
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
    .get<Completed>(TableName.COMPLETED)

    .query(Q.where("habit_id", this.id));
  @lazy sortedCompleted = this.completed.extend(
    Q.sortBy("completed_at", Q.desc)
  );
  toEditableHabit(): EditableHabit {
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
          differenceInCalendarWeeks(date, startOfWeek(this.startsOn)) %
            this.repeats.every_n ==
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
        .get<Completed>(TableName.COMPLETED)
        .create((completed) => {
          completed.completed_at = date;
          completed.completed_times = [];
          completed.habit.set(this);
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
      .get<Completed>(TableName.COMPLETED)
      .create((completed) => {
        completed.completed_at = date;
        completed.completed_times = [
          {
            date: date.getTime(),
            amount: this.goal.steps,
          },
        ];
        completed.habit.set(this);
        completed.goal = this.goal;
        completed.total = 0;
      });
    await this.callWriter(() => completed.complete(date));
  }

  @writer async endHabit(date: Date) {
    await this.update(() => {
      this.endsOn = date;
    });
  }

  markAsDeleted(): Promise<void> {
    this.completed.markAllAsDeleted();
    return super.markAsDeleted();
  }
}
