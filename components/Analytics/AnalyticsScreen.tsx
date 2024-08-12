import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { Habit } from "~/models/Habit";
import { log } from "~/lib/config";
import { useState } from "react";
import { useTheme } from "@react-navigation/native";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

import * as React from "react";
import { WeeklyContent, WeeklyHeader } from "~/components/Analytics/Weekly";
import { MonthlyContent, MonthlyHeader } from "~/components/Analytics/Monthly";
import { AllTimeContent, AllTimeHeader } from "~/components/Analytics/AllTime";

enum AnalyticsType {
  weekly = "weekly",
  monthly = "monthly",
  all_time = "all_time",
}

export function AnalyticsScreen({ habit }: { habit?: Habit }) {
  const [value, setValue] = useState<string>(AnalyticsType.weekly);
  const [date, setDate] = useState(new Date(Date.now()));
  console.log("Rendering Analytics Screen");
  return (
    <View className="h-full  w-full gap-3">
      <Tabs
        value={value}
        onValueChange={setValue}
        className="mx-2  flex-col gap-4"
      >
        <View className="px-5  flex-col justify-between">
          <View className="gap-3 mb-5">
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
          >
            <MonthlyHeader setDate={setDate} date={date} />
          </TabsContent>
          <TabsContent
            value={AnalyticsType.all_time}
            className="flex flex-col gap-2 "
          >
            <AllTimeHeader setDate={setDate} date={date} />
          </TabsContent>
        </View>
        <View className="bg-secondary h-full p-5">
          <TabsContent
            value={AnalyticsType.weekly}
            className="flex flex-col gap-3"
          >
            <WeeklyContent date={date} habit={habit} />
          </TabsContent>
          <TabsContent
            value={AnalyticsType.monthly}
            className="flex flex-col gap-2 "
          >
            <MonthlyContent date={date} habit={habit} />
          </TabsContent>
          <TabsContent
            value={AnalyticsType.all_time}
            className="flex flex-col gap-2 "
          >
            <AllTimeContent date={date} habit={habit} />
          </TabsContent>
        </View>
      </Tabs>
    </View>
  );
}
