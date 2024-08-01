import { useDatabase } from "@nozbe/watermelondb/hooks";
import { TableName } from "~/models/schema";
import { CompletedResult, Task } from "~/models/Task";
import { useEffect, useState } from "react";
import { Completed } from "~/models/Completed";
import {
  endOfDay,
  endOfWeek,
  isSameDay,
  isSameWeek,
  startOfDay,
  startOfWeek,
} from "date-fns";
import { log } from "~/lib/config";
import { Q } from "@nozbe/watermelondb";

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
  const [completed, setCompleted] = useState<CompletedResult>({
    total: 0,
    completed: [],
    isCompleted: false,
    streak: 0,
  });
  useEffect(() => {
    let subscriber = task
      .getCompletedQuery(date)
      .observe()
      .subscribe((a) => {
        let result = task.computeCompletedResult(a, date);

        setCompleted(result);
      });

    return () => subscriber.unsubscribe();
  }, [task, date]);

  return completed;
}
