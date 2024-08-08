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
import { addWeeks, endOfWeek, startOfWeek } from "date-fns";
import { Button } from "~/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react-native";

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

export function WeeklyContent({ date, task }: { date: Date; task: Task }) {
  return (
    <View>
      <Text>Weekly Content</Text>
    </View>
  );
}
