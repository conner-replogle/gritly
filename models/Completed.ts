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
  @immutableRelation(TableName.TASKS, "task_id") task!: Relation<Task>;
  @json("completed_at", (a) => a) completed_at!: Date[];
  @date("completion_time") date!: Date;
}
