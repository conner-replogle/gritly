import { useDatabase } from "@nozbe/watermelondb/hooks";
import { TableName } from "~/models/schema";
import { Habit } from "~/models/Habit";
import { useEffect, useState } from "react";
import { Completed } from "~/models/Completed";
import { log } from "~/lib/config";
import { Q } from "@nozbe/watermelondb";

export default function useHabits(date?: Date) {
  const database = useDatabase();
  const [habits, setHabits] = useState<Habit[]>([]);
  const habitsCollection = database.collections
    .get<Habit>(TableName.HABITS)
    .query();
  useEffect(() => {
    const subscription = habitsCollection.observe().subscribe(async (a) => {
      let b = a.filter((habit) => (date ? habit.showToday(date) : true));
      setHabits(b);
    });
    return () => subscription.unsubscribe();
  }, [date]);
  return habits;
}

export function useHabitsWithCompleted(date: Date) {
  const todayHabits = useHabits(date);
  const [habits, setHabits] = useState<
    {
      habit: Habit;
      completed?: Completed;
    }[]
  >([]);

  useEffect(() => {
    setHabits(
      todayHabits.map((habit) => ({
        habit,
        completed: undefined,
      }))
    );
    let subscriber = todayHabits.map((a) => {
      return a
        .getCompleted(date)
        .observeWithColumns(["total", "completed_times"])
        .subscribe((completeds) => {
          let completed = completeds[0];
          setHabits((prev) => {
            let index = prev.findIndex((b) => b.habit.id === a.id);
            if (index === -1 && completed) {
              return [...prev, { habit: a, completed }];
            } else {
              if (completed) {
                prev[index] = {
                  ...prev[index],
                  completed,
                };
              } else {
                prev[index] = {
                  ...prev[index],
                  completed: undefined,
                };
              }
              return [...prev];
            }
          });
        });
    });
    return () => {
      subscriber.map((a) => {
        a.unsubscribe();
      });
    };
  }, [todayHabits]);

  return habits;
}

export function useCompleted(habit?: Habit, startDate?: Date, endDate?: Date) {
  const database = useDatabase();
  const [completed, setCompleted] = useState<Completed[]>([]);

  useEffect(() => {
    let query = habit
      ? habit.sortedCompleted
      : database.collections.get<Completed>(TableName.COMPLETED).query();
    if (startDate) {
      query = query.extend(Q.where("completed_at", Q.gte(startDate.getTime())));
    }
    if (endDate) {
      query = query.extend(Q.where("completed_at", Q.lte(endDate.getTime())));
    }
    const subscription = query.observe().subscribe(async (a) => {
      setCompleted(a);
    });

    return () => subscription.unsubscribe();
  }, [habit]);
  return completed;
}
