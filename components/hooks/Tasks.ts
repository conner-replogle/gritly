import { useDatabase } from "@nozbe/watermelondb/hooks";
import { TableName } from "~/models/schema";
import { Task } from "~/models/Task";
import { useEffect, useState } from "react";
import { CompletedResult } from "~/models/CompletedResult";
import { log } from "~/lib/config";

export default function useTasks(date?: Date) {
  const database = useDatabase();
  const [tasks, setTasks] = useState<Task[]>([]);
  const tasksCollection = database.collections
    .get<Task>(TableName.TASKS)
    .query();
  useEffect(() => {
    const subscription = tasksCollection.observe().subscribe(async (a) => {
      let b = a.filter((task) => (date ? task.showToday(date) : true));
      setTasks(b);
    });
    return () => subscription.unsubscribe();
  }, [date]);
  return tasks;
}

export function useTasksWithCompleted(date: Date) {
  const todayTasks = useTasks(date);
  const [tasks, setTasks] = useState<
    {
      task: Task;
      completed?: CompletedResult;
    }[]
  >([]);

  useEffect(() => {
    setTasks(
      todayTasks.map((task) => ({
        task,
        completed: undefined,
      }))
    );
    let subscriber = todayTasks.map((a) => {
      return a
        .getCompleted(date)
        .observeWithColumns(["total", "completed_times"])
        .subscribe((completeds) => {
          let completed = completeds[0];
          setTasks((prev) => {
            let index = prev.findIndex((b) => b.task.id === a.id);
            if (index === -1 && completed) {
              return [...prev, { task: a, completed }];
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
  }, [todayTasks]);
  log.debug("Tasks Updated");

  return tasks;
}

export function useCompleted() {
  const database = useDatabase();
  const [completed, setCompleted] = useState<CompletedResult[]>([]);
  const completedCollection = database.collections
    .get<CompletedResult>(TableName.COMPLETED_RESULT)
    .query();
  useEffect(() => {
    const subscription = completedCollection.observe().subscribe(async (a) => {
      setCompleted(a);
    });
    return () => subscription.unsubscribe();
  }, []);
  return completed;
}

export function useStreak(task: Task, date: Date) {
  const [streak, setStreak] = useState(0);
  useEffect(() => {
    let subscriber = task.sortedCompleted.observe().subscribe((a) => {});

    return () => subscriber.unsubscribe();
  }, [task, date]);

  return streak;
}
