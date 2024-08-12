import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { Habit } from "~/models/Habit";

import * as React from "react";
import { addWeeks, endOfWeek, startOfDay, startOfWeek } from "date-fns";
import { Button } from "~/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react-native";
import { useCompleted } from "~/lib/hooks/Habits";
import { Summary } from "~/components/Analytics/widgets/Summary";
import { useEffect, useMemo } from "react";
import { useAnalytics } from "~/lib/hooks/Analytics";
import { ActiveWeekdays } from "~/components/Analytics/widgets/ActiveWeekdays";

export function WeeklyHeader({
  date,
  setDate,
}: {
  setDate: (date: Date) => void;
  date: Date;
}) {
  const start_date = startOfWeek(date);
  const end_date = endOfWeek(date);
  return (
    <View className="flex-row justify-between ">
      <View className="flex-col items-start justify-end ">
        <Text>This Week</Text>
        <Text>{`${start_date.toLocaleString(undefined, {
          month: "short",
          day: "numeric",
        })} - ${end_date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })}`}</Text>
      </View>
      <View className="flex-row">
        <Button
          variant="ghost"
          onPress={() => {
            setDate(addWeeks(date, -1));
          }}
        >
          <ArrowLeft />
        </Button>
        <Button
          variant="ghost"
          onPress={() => {
            setDate(addWeeks(date, 1));
          }}
        >
          <ArrowRight />
        </Button>
      </View>
    </View>
  );
}

export function WeeklyContent({ date, habit }: { date: Date; habit?: Habit }) {
  console.log("Rendering WEEK");
  const { start, end } = useMemo(() => {
    const start = startOfWeek(date);
    const end = endOfWeek(date);
    return { start, end };
  }, [date]);
  const analytics = useAnalytics(habit, start, end);

  return (
    <>
      <ActiveWeekdays analytics={analytics} habit={habit} />
      <Summary habit={habit} analytics={analytics} />
    </>
  );
}
