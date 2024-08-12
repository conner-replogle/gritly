import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { Habit } from "~/models/Habit";

import * as React from "react";

import { Summary } from "~/components/Analytics/widgets/Summary";
import { useAnalytics } from "~/lib/hooks/Analytics";
import { WeeklyContent } from "~/components/Analytics/Weekly";
import { ActiveWeekdays } from "~/components/Analytics/widgets/ActiveWeekdays";

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
    <>
      <ActiveWeekdays analytics={analytics} habit={habit} />
      <Summary analytics={analytics} />
    </>
  );
}
