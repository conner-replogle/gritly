import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { Habit } from "~/models/Habit";

import * as React from "react";
import { addMonths, endOfMonth, startOfDay, startOfMonth } from "date-fns";
import { Button } from "~/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react-native";
import { useCompleted } from "~/lib/hooks/Habits";
import { Summary } from "~/components/Analytics/widgets/Summary";
import { useEffect, useMemo } from "react";
import { useAnalytics } from "~/lib/hooks/Analytics";

export function MonthlyHeader({
  date,
  setDate,
}: {
  setDate: (date: Date) => void;
  date: Date;
}) {
  const start_date = startOfMonth(date);
  const end_date = endOfMonth(date);
  return (
    <View className="flex-row justify-between ">
      <View className="flex-col items-start justify-end ">
        <Text>This Month</Text>
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
            setDate(addMonths(date, -1));
          }}
        >
          <ArrowLeft />
        </Button>
        <Button
          variant="ghost"
          onPress={() => {
            setDate(addMonths(date, 1));
          }}
        >
          <ArrowRight />
        </Button>
      </View>
    </View>
  );
}

export function MonthlyContent({ date, habit }: { date: Date; habit?: Habit }) {
  console.log("Rendering Month");
  const { start, end } = useMemo(() => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return { start, end };
  }, [date]);
  const analytics = useAnalytics(habit, start, end);

  return (
    <View>
      <Summary analytics={analytics} />
    </View>
  );
}
