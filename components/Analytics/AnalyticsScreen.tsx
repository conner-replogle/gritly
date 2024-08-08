import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { Task } from "~/models/Task";
import { useAnalytics } from "~/components/hooks/Analytics";
import { log } from "~/lib/config";
import { LineChart } from "react-native-gifted-charts";
import { useState } from "react";
import { useTheme } from "@react-navigation/native";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { TaskCard } from "~/components/Task/taskCard";
import { Goal } from "~/components/Task/EditTaskScreen/Goal";
import * as React from "react";
import { WeeklyContent, WeeklyHeader } from "~/components/Analytics/Weekly";

enum AnalyticsType {
  weekly = "weekly",
  monthly = "monthly",
  all_time = "all_time",
}

export function AnalyticsScreen({ task }: { task: Task }) {
  const { colors } = useTheme();
  const [value, setValue] = useState<string>(AnalyticsType.weekly);
  const [date, setDate] = useState(new Date(Date.now()));
  const analytics = useAnalytics(task);
  console.log("Analytics", analytics.history);
  log.debug(`Start: ${task.startsOn}, End: ${task.endsOn}`);
  const [layout, setLayout] = useState([0, 0]);
  return (
    <View className="h-full  w-full gap-3">
      <Tabs
        value={value}
        onValueChange={setValue}
        className="mx-2  flex-col gap-4"
      >
        <View className="px-5 h-1/6 flex-col justify-between">
          <Text className="text-2xl font-semibold ">
            {task.title} Analytics
          </Text>

          <TabsList className="flex-row ">
            <TabsTrigger value={AnalyticsType.weekly} className="flex-1">
              <Text>Weekly</Text>
            </TabsTrigger>
            <TabsTrigger value={AnalyticsType.monthly} className="flex-1">
              <Text>Monthly</Text>
            </TabsTrigger>
            <TabsTrigger value={AnalyticsType.all_time} className="flex-1">
              <Text>All-Time</Text>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={AnalyticsType.weekly}>
            <WeeklyHeader date={date} setDate={setDate} />
          </TabsContent>
          <TabsContent
            value={AnalyticsType.monthly}
            className="flex flex-col gap-2 "
          ></TabsContent>
          <TabsContent
            value={AnalyticsType.all_time}
            className="flex flex-col gap-2 "
          >
            <Text className="text-l font-semibold text-muted-foreground">
              GOAL
            </Text>
            <View className="bg-secondary p-3 rounded-xl"></View>
          </TabsContent>
        </View>
        <View className="bg-secondary h-full p-5">
          <TabsContent
            value={AnalyticsType.weekly}
            className="flex flex-col gap-3"
          >
            <WeeklyContent date={date} task={task} />
          </TabsContent>
          <TabsContent
            value={AnalyticsType.monthly}
            className="flex flex-col gap-2 "
          ></TabsContent>
          <TabsContent
            value={AnalyticsType.all_time}
            className="flex flex-col gap-2 "
          >
            <Text className="text-l font-semibold text-muted-foreground">
              GOAL
            </Text>
            <View className="bg-secondary p-3 rounded-xl"></View>
          </TabsContent>
          <View
            onLayout={(a) =>
              setLayout([
                a.nativeEvent.layout.width,
                a.nativeEvent.layout.height,
              ])
            }
            className="h-64 p-5 justify-center items-center flex-col"
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
      </Tabs>
    </View>
  );
}
