import * as React from "react";
import { FlatList, Pressable, View } from "react-native";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import uuid from "react-native-uuid";
import "react-native-get-random-values";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import { Text } from "~/components/ui/text";

import { SafeAreaView } from "react-native-safe-area-context";

import { AddTasks } from "~/components/AddTask/AddTasks";
import { useQuery, useRealm } from "@realm/react";
import { Completed, Task } from "~/lib/states/task";
import { Button } from "~/components/ui/button";

import { CalendarSection } from "~/components/Calendar/Calendar";

import TaskContent from "~/components/Task/task";
import { useCallback, useEffect, useState } from "react";

import { ThemeToggle } from "~/components/ThemeToggle";
import { CollectionChangeCallback } from "realm";
import SettingsButton from "~/components/Settings/Settings";

const DateContext = React.createContext(new Date(Date.now()));
export default function Screen() {
  const [date, setInnerDate] = React.useState(new Date(Date.now()));
  const setDate = useCallback((date: Date) => {
    date.setHours(6, 0, 0, 0);
    setInnerDate(date);
  }, []);
  const [tasks, setTasks] = useState<Task[] | undefined>(undefined);
  const realm = useRealm();

  const handleChanges: CollectionChangeCallback<Task, [number, Task]> =
    useCallback((newTasks, changes) => {
      if (changes.insertions.length == 0 && changes.deletions.length == 0) {
        return;
      }
      setTasks(newTasks.map((a) => a) as Task[]);
    }, []);
  useEffect(() => {
    const tasks = realm.objects(Task);
    tasks.addListener(handleChanges);
    setTasks(tasks as unknown as Task[]);
    return () => {
      tasks.removeListener(handleChanges);
    };
  }, []);
  console.log(`User Realm User file location: ${realm.path}`);
  console.log(`Current Date ${date}`);
  if (tasks === undefined) {
    return <Text>Loading...</Text>;
  }
  const todayTasks = tasks.filter((a) => a.showToday(date)).map((a) => a._id);
  console.log(tasks);
  return (
    <SafeAreaView>
      <View className="h-[100vh] bg-secondary/50">
        <HeaderCard date={date} setDate={setDate} />

        <View className="p-6 flex flex-col gap-4 h-full">
          <FlatList
            ListFooterComponent={AddTasks}
            data={todayTasks}
            renderItem={(item) => (
              <TaskContent date={date} task_id={item.item} />
            )}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
function HeaderCard({
  date,
  setDate,
}: {
  date: Date;
  setDate: (date: Date) => void;
}) {
  const tasks = useQuery(Task).filtered("startDate <= $0", date);
  const todayTasks = tasks.filter((a) => a.showToday(date));

  const daily = todayTasks.filter((a) => a.repeats.period == "Daily");
  const weekly = todayTasks.filter((a) => a.repeats.period == "Weekly");
  return (
    <View className="bg-background">
      <CardHeader className="flex flex-row justify-between  items-center">
        <View>
          <CardTitle className="text-start">
            {date.toLocaleString("en-US", {
              year: "2-digit",
              month: "long",
              day: "numeric",
            })}
          </CardTitle>
          <CardDescription className="text-base font-semibold">
            {date.toLocaleString("en-US", { weekday: "long" })}
          </CardDescription>
        </View>
        <View className="flex flex-row items-center gap-2">
          <Button
            variant={"outline"}
            size="sm"
            onPress={() => {
              setDate(new Date(Date.now()));
            }}
          >
            <Text>Today</Text>
          </Button>
          <SettingsButton />
        </View>
      </CardHeader>
      <CardContent>
        <View className="flex-row justify-around gap-4">
          <View className="items-center w-12">
            <Text className="text-sm text-muted-foreground">Daily</Text>
            <Text className="text-xl font-semibold">
              {daily.filter((a) => a.getCompleted(date)?.isCompleted()).length}{" "}
              / {daily.length}
            </Text>
          </View>
          <View className="items-center w-12">
            <Text className="text-sm text-muted-foreground">Weekly</Text>
            <Text className="text-xl font-semibold">
              {weekly.filter((a) => a.getCompleted(date)?.isCompleted()).length}{" "}
              / {weekly.length}
            </Text>
          </View>
          <View className="items-center w-12">
            <Text className="text-sm text-muted-foreground">Daily</Text>
            <Text className="text-xl font-semibold">14</Text>
          </View>
        </View>
      </CardContent>
      <CardFooter>
        <CalendarSection date={date} setDate={setDate} />
      </CardFooter>
    </View>
  );
}
