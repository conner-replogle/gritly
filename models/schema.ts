import { appSchema, tableSchema } from "@nozbe/watermelondb";

export const CALENDAR = ["S", "M", "T", "W", "Th", "F", "Sa"];

export const UNITS = [
  {
    name: "Custom",
    value: "custom",
    type: "count",
  },
  {
    name: "Minutes",
    value: "minutes",
    type: "time",
  },
  {
    name: "Hours",
    value: "hours",
    type: "time",
  },
  {
    name: "Yards",
    value: "yards",
    type: "length",
  },
  {
    name: "Miles",
    value: "miles",
    type: "length",
  },
  {
    name: "Count",
    value: "count",
    type: "count",
  },
];
export enum TableName {
  TASKS = "tasks",
  COMPLETED = "completed",
}

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: TableName.TASKS,
      columns: [
        { name: "title", type: "string" },
        { name: "description", type: "string" },
        { name: "color", type: "string" },
        { name: "starts_on", type: "number" },
        { name: "ends_on", type: "number", isOptional: true },
        { name: "created_at", type: "number" },
        { name: "repeats", type: "string" },
        { name: "goal", type: "string" },
      ],
    }),
    tableSchema({
      name: TableName.COMPLETED,
      columns: [
        { name: "amount", type: "number" },
        { name: "task_id", type: "string" },
        { name: "created_at", type: "number" },
        { name: "goal", type: "string" },
        { name: "completed_at", type: "number", isOptional: true },
      ],
    }),
  ],
});
