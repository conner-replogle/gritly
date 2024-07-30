import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { Task } from "~/models/Task";
import { useAnalytics } from "~/components/hooks/Analytics";
import { log } from "~/lib/config";
import { LineChart } from "react-native-gifted-charts";
import { useState } from "react";
import { useTheme } from "@react-navigation/native";

export function AnalyticsScreen({ task }: { task: Task }) {
  const { colors } = useTheme();
  const analytics = useAnalytics(task);
  console.log("Analytics", analytics.history);
  log.debug(`Start: ${task.startsOn}, End: ${task.endsOn}`);
  const [layout, setLayout] = useState([0, 0]);
  return (
    <View className="h-full p-5 w-full gap-3">
      <Text className="text-xl font-semibold">{task.title} Analytics</Text>
      <View
        onLayout={(a) =>
          setLayout([a.nativeEvent.layout.width, a.nativeEvent.layout.height])
        }
        className="bg-secondary rounded-xl h-64 p-5 justify-center items-center flex-col"
      >
        {analytics.history.length > 0 && (
          <LineChart
            height={layout[1] - 75}
            width={layout[0] - 50}
            data={analytics.history.map((a) => ({
              value: a.value,
            }))}
            spacing={50}
            color={colors.primary}
            scrollToEnd={true}
            curved={true}
            thickness={3}
            textColor={colors.primary}
            xAxisLabelTextStyle={{ color: colors.primary }}
            xAxisLabelTexts={analytics.history.map(
              (a) => `${a.date.getMonth()}/${a.date.getDate()}`
            )}
            dataPointsColor={colors.primary}
            hideYAxisText
            showVerticalLines
            hideAxesAndRules
          />
        )}
        {analytics.history.length == 0 && <Text>No data</Text>}
      </View>
      <View className="flex-row flex-wrap gap-3 justify-evenly">
        <View className="bg-secondary rounded-xl p-5 flex-1  flex-col items-center">
          <Text className="text-xl font-bold">{analytics.total}</Text>
          <Text>COMPLETED</Text>
        </View>
        <View className="bg-secondary rounded-xl p-5 flex-1 flex-col items-center">
          <Text className="text-xl font-bold">{analytics.total}</Text>
          <Text>BEST STREAK</Text>
        </View>
      </View>
    </View>
  );
}
