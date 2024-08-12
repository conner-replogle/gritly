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

export function AllTimeHeader({
  date,
  setDate,
}: {
  setDate: (date: Date) => void;
  date: Date;
}) {
  return (
    <View className="flex-row justify-between ">
      <View className="flex-col items-start justify-end "></View>
      <View className="flex-row"></View>
    </View>
  );
}

export function AllTimeContent({ date, habit }: { date: Date; habit?: Habit }) {
  const analytics = useAnalytics(habit);

  return (
    <View>
      <Summary analytics={analytics} />
    </View>
  );
}
