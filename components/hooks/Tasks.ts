import { useDatabase } from "@nozbe/watermelondb/hooks";
import { TableName } from "~/models/schema";
import { Task } from "~/models/Task";
import { useEffect, useState } from "react";
import { Completed } from "~/models/Completed";
import { isSameDay, isSameWeek } from "date-fns";
import { log } from "~/lib/config";
import { withObservables } from "@nozbe/watermelondb/react";

export default function useTasks(date?: Date) {
  const database = useDatabase();
  const [tasks, setTasks] = useState<Task[]>([]);
  const tasksCollection = database.collections
    .get<Task>(TableName.TASKS)
    .query();
  useEffect(() => {
    const subscription = tasksCollection.observe().subscribe((a) => {
      setTasks(a.filter((task) => (date ? task.showToday(date) : true)));
    });
    return () => subscription.unsubscribe();
  }, [date]);
  return tasks;
}

export function useCompleted(task: Task, date: Date) {
  const [completed, setCompleted] = useState<Completed | undefined>(undefined);
  useEffect(() => {
    let subscriber = task.sortedCompleted.observe().subscribe((a) => {
      const completed = a.find((completed) => {
        if (task.repeats.period == "Weekly") {
          if (isSameWeek(completed.createdAt, date)) return true;
        }
        if (task.repeats.period == "Daily") {
          if (isSameDay(completed.createdAt, date)) return true;
        }
        return false;
      });

      setCompleted(completed);
    });

    return () => subscriber.unsubscribe();
  }, [task, date]);

  return completed;
}
