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
import { Habit } from "~/models/Habit";

export class Group extends Model {
  static table = TableName.GROUP;
  static associations = {
    [TableName.HABITS]: {
      type: "has_many" as const,
      foreignKey: "group_id",
    },
  };

  @lazy habits = this.collections
    .get<Habit>(TableName.HABITS)
    .query(Q.where("group_id", this.id));

  @field("title") title!: string;
  @date("created_at") created_at!: Date;
}
