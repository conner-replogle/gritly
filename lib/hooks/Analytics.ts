import { Task } from "~/models/Task";
import { useEffect, useState } from "react";
import { log } from "~/lib/config";
import { startOfDay, startOfWeek } from "date-fns";
export interface Analytics {
  history: { date: Date; value: number }[];
  min: number;
  max: number;
  total: number;
}

export function useAnalytics(task: Task) {
  const [analytics, setAnalytics] = useState<Analytics>({
    history: [],
    max: 0,
    min: 0,
    total: 0,
  });

  useEffect(() => {
    let fetch = async () => {
      let completed = await task.sortedCompleted.fetch();

      let map = new Map<number, number>();

      completed.forEach((a) => {
        let key: number;
        if (task.repeats.period == "Daily") {
          key = startOfDay(a.completed_at).getTime();
        } else if (task.repeats.period == "Weekly") {
          key = startOfWeek(a.completed_at).getTime();
        } else {
          log.debug("Unsupported period");
          throw new Error("Unsupported period");
        }
        if (map.has(key)) {
          let amount = map.get(key)!;

          log.debug(`Setting ${key} to ${amount} + ${a.total}`);
          map.set(key, amount + a.total);
        } else {
          log.debug(`Setting ${key} to ${a.total}`);
          map.set(key, a.total);
        }
      });
      let history: Array<{ date: Date; value: number }> = [];
      for (let [key, value] of map) {
        log.debug(`Key: ${new Date(key)}, Value: ${value}`);
        history.push({ date: new Date(key), value: value });
      }

      let min = Math.min(...history.map((a) => a.value));
      let max = Math.max(...history.map((a) => a.value));
      log.debug(`Min: ${min}, Max: ${max}`);
      setAnalytics({
        history: history,
        min: min,
        max: max,
        total: history.length,
      });
    };
    fetch();
  }, [task]);
  return analytics;
}
