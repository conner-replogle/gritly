import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { Task } from "~/models/Task";
import { log } from "~/lib/config";
import { useState } from "react";
import { useTheme } from "@react-navigation/native";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

import * as React from "react";
import { WeeklyContent, WeeklyHeader } from "~/components/Analytics/Weekly";

enum AnalyticsType {
  weekly = "weekly",
  monthly = "monthly",
  all_time = "all_time",
}

export function AnalyticsScreen({ task }: { task?: Task }) {
  const [value, setValue] = useState<string>(AnalyticsType.weekly);
  const [date, setDate] = useState(new Date(Date.now()));
  return (
    <View className="h-full  w-full gap-3">
      <Tabs
        value={value}
        onValueChange={setValue}
        className="mx-2  flex-col gap-4"
      >
        <View className="px-5 h-1/6 flex-col justify-between">
          <View className="gap-3">
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
          </View>

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
        </View>
      </Tabs>
    </View>
  );
}
