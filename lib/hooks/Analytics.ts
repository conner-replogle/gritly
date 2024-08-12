import { Habit } from "~/models/Habit";
import { useEffect, useState } from "react";
import {
  endOfDay,
  endOfWeek,
  isSameDay,
  isSameWeek,
  startOfDay,
} from "date-fns";
import { getNextDate } from "~/lib/utils";
import { Completed } from "~/models/Completed";
import { TableName } from "~/models/schema";
import { Q } from "@nozbe/watermelondb";
import { useDatabase } from "@nozbe/watermelondb/hooks";
import { Period } from "~/lib/types";
import { amd } from "globals";

export interface Analytics {
  streaks: number[];
  streak: number;
  completed: number;
  uncompleted: number;
  total: number;
  skipped: number;
  common_days: number[];
  therotical_total: number;
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
    common_days: [0, 0, 0, 0, 0, 0, 0],
    therotical_total: 0,
  });
  console.log("Rerunning analytics");

  useEffect(() => {
    let get = async () => {
      const getHabit = async (habit: Habit, count_by_amount = true) => {
        console.log("Computing analytics");
        let today = new Date(Date.now());
        let start_date = new Date(start || habit?.startsOn);
        let end_date = new Date(end || Date.now());
        if (end_date > today) {
          end_date = endOfDay(today);
        }
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
        let therotical_total = 0;
        let total = 0;
        let skipped = 0;
        let common_days = [0, 0, 0, 0, 0, 0, 0];

        while (true) {
          if (start_date > end_date) {
            break;
          }
          let is_completed = completeds.find((a) => {
            switch (habit.repeats.period) {
              case Period.Daily:
                return isSameDay(a.completed_at, start_date);
              case Period.Weekly:
                return isSameWeek(a.completed_at, startOfDay(start_date));
              case Period.Monthly:
                return start_date.getMonth() === a.completed_at.getMonth();
            }
          });

          if (is_completed && !is_completed.skipped) {
            total += is_completed.total;
            for (let day of is_completed.completed_times) {
              let date = new Date(day.date);

              //When all habits do by 1 when habit only do by amount
              if (count_by_amount) {
                common_days[date.getDay()] += day.amount;
              } else {
                common_days[date.getDay()] += 1;
              }
            }
            streak += 1;
            completed += 1;
            therotical_total += is_completed.goal.amount;
          } else {
            if (is_completed && is_completed.skipped) {
              skipped += 1;
            }
            uncompleted += 1;
            therotical_total += habit.goal.amount;
            if (streak > 0) {
              streaks.push(streak);
            }
            streak = 0;
          }
          start_date = getNextDate(habit.repeats, start_date);
        }
        return {
          streaks,
          streak,
          completed,
          uncompleted,
          total,
          skipped,
          common_days,
          therotical_total,
        };
      };

      if (habit) {
        let data = await getHabit(habit);
        setAnalytics(data);
      } else {
        const habits = await database.collections
          .get<Habit>(TableName.HABITS)
          .query()
          .fetch();
        let analyti: Analytics = {
          streaks: [],
          streak: 0,
          completed: 0,
          uncompleted: 0,
          total: 0,
          skipped: 0,
          common_days: [0, 0, 0, 0, 0, 0, 0],
          therotical_total: 0,
        };
        for (let i = 0; i < habits.length; i++) {
          let {
            streaks,
            streak,
            completed,
            uncompleted,
            total,
            skipped,
            common_days,
            therotical_total,
          } = await getHabit(habits[i], false);
          analyti.streaks = analyti.streaks.concat(streaks);
          analyti.streak += streak;
          analyti.completed += completed;
          analyti.uncompleted += uncompleted;
          analyti.total += total;
          analyti.skipped += skipped;
          analyti.therotical_total += therotical_total;
          analyti.common_days = analyti.common_days.map(
            (a, i) => a + common_days[i]
          );
        }

        setAnalytics(analyti);
      }
    };
    get();
  }, [habit, start, end]);

  console.log(analytics);
  return analytics;
}
