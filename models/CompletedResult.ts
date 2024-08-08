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
import { Goal, Task } from "~/models/Task";

export class CompletedResult extends Model {
  static table = TableName.COMPLETED_RESULT;

  @field("total") total!: number;
  @json("goal", (a) => a) goal!: Goal;
  @immutableRelation(TableName.TASKS, "task_id") task!: Relation<Task>;
  @field("is_skipped") skipped!: boolean;
  @date("completed_at") completed_at!: Date;
  @json("completed_times", (a) => a) completed_times!: {
    date: number;
    amount: number;
  }[];
  get isCompleted() {
    return this.total >= this.goal.amount;
  }

  @writer async skip() {
    await this.update((task) => {
      this.skipped = true;
    });
  }
  @writer async unskip() {
    await this.update((task) => {
      this.skipped = false;
    });
  }

  @writer async complete(date: Date) {
    await this.update((task) => {
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

  @writer async uncomplete() {
    let last_time = this.completed_times.pop();
    if (last_time) {
      this.total -= last_time.amount;
    } else {
      await this.destroyPermanently();
    }
  }
}
