import * as React from "react";
import { FlatList, Pressable, View } from "react-native";
import Animated, {
  FadeIn,
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

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import { Text } from "~/components/ui/text";

import { SafeAreaView } from "react-native-safe-area-context";

import { AddTasks } from "~/components/AddTask/AddTasks";

import { Button } from "~/components/ui/button";

import { CalendarSection } from "~/components/Calendar/Calendar";

import TaskContent from "~/components/Task/task";
import {
  createContext,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import ConfettiCannon from "react-native-confetti-cannon";
import { useMMKV, useMMKVBoolean } from "react-native-mmkv";
import { ExplosionContext, log } from "~/lib/config";
import { DropdownMenuTriggerRef } from "@rn-primitives/dropdown-menu";
import useTasks from "~/components/hooks/Tasks";
import { Task } from "~/models/Task";
import { endOfDay, startOfDay } from "date-fns";

export default function Screen() {
  const [date, setInnerDate] = React.useState(startOfDay(Date.now()));
  const storage = useMMKV();

  const setDate = useCallback((date: Date) => {
    setInnerDate(startOfDay(date));
  }, []);
  const [nuttable, _] = useMMKVBoolean("settings.nuttable");

  const tasks = useTasks(date);
  const cannonRef = useRef<ConfettiCannon>(null);

  if (tasks === undefined) {
    return <Text>Loading...</Text>;
  }

  return (
    <SafeAreaView>
      <ExplosionContext.Provider
        value={() => {
          if (nuttable) cannonRef.current?.start();
        }}
      >
        <View className="h-[100vh] bg-secondary/50">
          <HeaderCard date={date} setDate={setDate} todayTasks={tasks} />

          <View className="p-6 flex flex-col gap-4 h-full">
            <FlatList
              ListFooterComponent={AddTasks}
              data={tasks}
              renderItem={(item) => (
                <TaskContent date={date} task={item.item} />
              )}
            />
          </View>
          <ConfettiCannon
            ref={cannonRef}
            count={200}
            explosionSpeed={400}
            fallSpeed={3500}
            autoStart={false}
            fadeOut={true}
            origin={{ x: 10, y: 0 }}
          />
        </View>
      </ExplosionContext.Provider>
    </SafeAreaView>
  );
}
function HeaderCard({
  date,
  setDate,
  todayTasks,
}: {
  date: Date;
  setDate: (date: Date) => void;
  todayTasks: Task[];
}) {
  const daily = todayTasks.filter((a) => a.repeats.period == "Daily");
  const weekly = todayTasks.filter((a) => a.repeats.period == "Weekly");

  const tiggerRef = useRef<DropdownMenuTriggerRef>(null);
  return (
    <View className="bg-background">
      <CardHeader className="flex flex-row justify-between  items-start">
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
        <View className="flex flex-row items-start gap-2">
          <Button
            variant={"outline"}
            size="sm"
            onPress={() => {
              setDate(new Date(Date.now()));
            }}
          >
            <Text>Today</Text>
          </Button>
        </View>
      </CardHeader>
      <CardContent>
        <CalendarSection date={date} setDate={setDate} />
      </CardContent>
    </View>
  );
}
