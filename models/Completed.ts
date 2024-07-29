import { Model, Relation } from "@nozbe/watermelondb";
import {
  date,
  immutableRelation,
  readonly,
  text,
  json,
  field,
  writer,
} from "@nozbe/watermelondb/decorators";

import { TableName } from "./schema";
import { Goal, Task } from "~/models/Task";

export class Completed extends Model {
  static table = TableName.COMPLETED;

  @field("amount") amount!: number;
  @date("created_at") createdAt!: Date;
  @immutableRelation(TableName.TASKS, "task_id") task!: Relation<Task>;
  @date("completed_at") completedAt?: Date;
  @json("goal", (json) => json) goal!: Goal;

  isCompleted(): boolean {
    return this.amount >= this.goal.amount;
  }

  @writer async complete(amount: number, completedAt: Date) {
    await this.update((completed) => {
      completed.amount += amount;
      if (completed.amount >= completed.goal.amount) {
        completed.completedAt = completedAt;
      }
    });
  }
}
