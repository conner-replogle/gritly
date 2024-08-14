import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";
import { setGenerator } from "@nozbe/watermelondb/utils/common/randomId";
import * as Crypto from "expo-crypto";
import { Habit } from "~/models/Habit";
import { schema } from "~/models/schema";
import { Completed } from "~/models/Completed";
import { Group } from "~/models/Group";
import { migrations } from "~/lib/migrations";

// First, create the adapter to the underlying database:
const adapter = new SQLiteAdapter({
  schema,
  // (You might want to comment it out for development purposes -- see Migrations documentation)
  migrations,
  // (optional database name or file system path)
  dbName: "gritly",
  // (recommended option, should work flawlessly out of the box on iOS. On Android,
  // additional installation steps have to be taken - disable if you run into issues...)
  jsi: true /* Platform.OS === 'ios' */,
  // (optional, but you should implement this method)

  onSetUpError: (error) => {
    // Database failed to load -- offer the user to reload the app or log out
    console.error(error);
  },
});

// Then, make a Watermelon database from it!
export const database = new Database({
  adapter,
  modelClasses: [Completed, Habit, Group],
});

setGenerator(() => Crypto.randomUUID());
