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
  HABITS = "habits",
  COMPLETED = "completed",
  GROUP = "group",
}

export const schema = appSchema({
  version: 2,
  tables: [
    tableSchema({
      name: TableName.HABITS,
      columns: [
        { name: "title", type: "string" },
        { name: "description", type: "string" },
        { name: "icon", type: "string", isOptional: true },
        { name: "color", type: "string" },
        { name: "starts_on", type: "number" },
        { name: "ends_on", type: "number", isOptional: true },
        { name: "created_at", type: "number" },
        { name: "repeats", type: "string" },
        { name: "goal", type: "string" },
        { name: "group_id", type: "string", isOptional: true },
      ],
    }),
    tableSchema({
      name: TableName.GROUP,
      columns: [
        { name: "title", type: "string" },
        { name: "created_at", type: "number" },
      ],
    }),

    tableSchema({
      name: TableName.COMPLETED,
      columns: [
        { name: "habit_id", type: "string" },
        { name: "completed_at", type: "number" },
        { name: "total", type: "number" },
        { name: "completed_times", type: "string" },
        { name: "is_skipped", type: "boolean" },
        { name: "goal", type: "string" },
      ],
    }),
  ],
});
