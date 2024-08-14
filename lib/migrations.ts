import {
  addColumns,
  createTable,
  schemaMigrations,
} from "@nozbe/watermelondb/Schema/migrations";
import { TableName } from "~/models/schema";

export const migrations = schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: [
        // Step to create the new Groups table
        createTable({
          name: TableName.GROUP,
          columns: [
            { name: "title", type: "string" },
            { name: "created_at", type: "number" },
          ],
        }),
        // Step to add the group_id column to the Habits table
        addColumns({
          table: TableName.HABITS,
          columns: [{ name: "group_id", type: "string", isOptional: true }],
        }),
      ],
    },
  ],
});
