import { Model, Q, Relation } from "@nozbe/watermelondb";
import {
  date,
  immutableRelation,
  readonly,
  text,
  json,
  field,
  writer,
  lazy,
} from "@nozbe/watermelondb/decorators";

import { TableName } from "./schema";
import { Goal } from "~/lib/types";
import { Habit } from "~/models/Habit";
import { log } from "~/lib/config";

export class Completed extends Model {
  static table = TableName.COMPLETED;

  @field("total") total!: number;
  @json("goal", (a) => a) goal!: Goal;
  @immutableRelation(TableName.HABITS, "habit_id") habit!: Relation<Habit>;
  @field("is_skipped") skipped!: boolean;
  @date("completed_at") completed_at!: Date;
  @json("completed_times", (a) => a) completed_times!: {
    date: number;
    amount: number;
  }[];

  get isCompleted() {
    return this.total >= this.goal.amount;
  }

  @writer
  async skip() {
    await this.update((habit) => {
      this.skipped = true;
    });
  }

  @writer
  async unskip() {
    await this.update((habit) => {
      this.skipped = false;
    });
  }

  @writer
  async complete(date: Date) {
    await this.update((habit) => {
      this.completed_times = [
        ...this.completed_times,
        { date: date.getTime(), amount: this.goal.steps },
      ];
      this.completed_times = this.completed_times.sort(
        (a, b) => a.date - b.date
      );

      this.total += this.goal.steps;
    });
  }

  @writer
  async uncomplete() {
    let del = false;
    await this.update((habit) => {
      let last_time = this.completed_times.pop();
      this.completed_times = this.completed_times.slice(0, -1);
      if (this.completed_times.length != 0 && last_time) {
        log.debug("Removing last completion");
        this.total -= last_time.amount;
      } else {
        log.debug("Deleting completed");
        del = true;
      }
    });
    if (del) {
      await this.destroyPermanently();
    }
  }
}
