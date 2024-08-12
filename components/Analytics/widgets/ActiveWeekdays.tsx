import { Completed } from "~/models/Completed";
import { Habit } from "~/models/Habit";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { BarChart2, Clipboard } from "lucide-react-native";
import { useTheme } from "@react-navigation/native";
import { Analytics } from "~/lib/hooks/Analytics";
import { BarChart } from "react-native-gifted-charts";
import { CALENDAR } from "~/models/schema";
import { useState } from "react";

export function ActiveWeekdays({
  analytics,
  habit,
}: {
  analytics: Analytics;
  habit?: Habit;
}) {
  const { colors } = useTheme();
  const [dimn, setDimn] = useState({ width: 0, height: 0 });
  const barData = analytics.common_days.map((value, index) => ({
    value: value,
    label: CALENDAR[index],
    topLabelComponent:
      value > 0
        ? () => <Text className="font-semibold text-sm">{value}</Text>
        : undefined,
  }));
  return (
    <View className="bg-background w-full p-5 rounded-xl">
      <View className="flex-row items-center">
        <BarChart2 className="aspect-square" size={32} color={colors.primary} />
        <View
          style={{
            marginLeft: 10,
          }}
          className="flex-col "
        >
          <Text className="font-semibold">
            {habit ? habit.title : "All Habits"}
          </Text>

          <Text className="text-sm">Most Active Weekdays</Text>
        </View>
      </View>
      <View
        onLayout={(a) => {
          setDimn(a.nativeEvent.layout);
        }}
      >
        <BarChart
          barWidth={22}
          width={dimn.width}
          height={100}
          noOfSections={3}
          barBorderRadius={4}
          frontColor={colors.primary}
          data={barData}
          stepValue={habit?.goal.amount}
          maxValue={
            Math.max(...analytics.common_days) + (habit?.goal.amount ?? 10)
          }
          yAxisThickness={0}
          xAxisThickness={0}
          hideYAxisText
          hideAxesAndRules
          disableScroll
        />
      </View>
    </View>
  );
}
