import { Habit } from "~/models/Habit";
import { useEffect, useState } from "react";
import { log } from "~/lib/config";
import { endOfDay, isSameDay, startOfDay, startOfWeek } from "date-fns";
import { useCompleted } from "~/lib/hooks/Habits";
import { getNextDate } from "~/lib/utils";
import { Completed } from "~/models/Completed";
import { TableName } from "~/models/schema";
import { Q } from "@nozbe/watermelondb";
import { useDatabase } from "@nozbe/watermelondb/hooks";
export interface Analytics {
  streaks: number[];
  streak: number;
  completed: number;
  uncompleted: number;
  total: number;
  skipped: number;
}

export function useAnalytics(habit?: Habit, start?: Date, end?: Date) {
  const database = useDatabase();
  const [analytics, setAnalytics] = useState<Analytics>({
    streaks: [],
    streak: 0,
    completed: 0,
    uncompleted: 0,
    total: 0,
    skipped: 0,
  });
  console.log("Rerunning analytics");

  useEffect(() => {
    let get = async () => {
      if (habit) {
        console.log("Computing analytics");
        console.log(start);
        let start_date = new Date(start || habit.startsOn);
        let end_date = new Date(end || Date.now());
        let query = habit
          ? habit.sortedCompleted
          : database.collections.get<Completed>(TableName.COMPLETED).query();
        if (start) {
          query = query.extend(
            Q.where("completed_at", Q.gte(startOfDay(start_date).getTime()))
          );
        }
        if (end) {
          query = query.extend(
            Q.where("completed_at", Q.lte(endOfDay(end_date).getTime()))
          );
        }
        let completeds = await query.fetch();
        let streaks = [];
        let streak = 0;
        let completed = 0;
        let uncompleted = 0;
        let total = 0;
        let skipped = 0;
        while (true) {
          if (start_date > end_date) {
            break;
          }
          let is_completed = completeds.find((a) => {
            return isSameDay(a.completed_at, start_date);
          });

          if (is_completed && !is_completed.skipped) {
            total += is_completed.total;
            streak += 1;
            completed += 1;
          } else {
            if (is_completed && is_completed.skipped) {
              skipped += 1;
            }
            uncompleted += 1;
            if (streak > 0) {
              streaks.push(streak);
            }
            streak = 0;
          }
          start_date = getNextDate(habit.repeats, start_date);
        }
        setAnalytics({
          streaks,
          streak,
          completed,
          uncompleted,
          total,
          skipped,
        });
      }
    };
    get();
  }, [habit, start, end]);

  console.log(analytics);
  return analytics;
}
