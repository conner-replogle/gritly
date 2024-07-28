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
import { useQuery, useRealm } from "@realm/react";
import { Completed, Task } from "~/lib/states/task";
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

import { ThemeToggle } from "~/components/ThemeToggle";
import { CollectionChangeCallback } from "realm";
import SettingsButton from "~/components/Settings/Settings";
import ConfettiCannon from "react-native-confetti-cannon";
import { useMMKV, useMMKVBoolean } from "react-native-mmkv";
import { ExplosionContext, log } from "~/lib/config";
import { PortalHost } from "~/components/primitives/portal";
import { DropdownMenuTriggerRef } from "@rn-primitives/dropdown-menu";

export default function Screen() {
  const [date, setInnerDate] = React.useState(new Date(Date.now()));
  const storage = useMMKV();

  const setDate = useCallback((date: Date) => {
    date.setHours(6, 0, 0, 0);
    setInnerDate(date);
  }, []);
  const [nuttable, _] = useMMKVBoolean("settings.nuttable");

  const [tasks, setTasks] = useState<Task[] | undefined>(undefined);
  const realm = useRealm();
  const cannonRef = useRef<ConfettiCannon>(null);
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

  if (tasks === undefined) {
    return <Text>Loading...</Text>;
  }
  const todayTasks = tasks.filter((a) => a.showToday(date)).map((a) => a._id);
  log.debug(`Date ${date}`);
  log.debug(`Today Tasks ${todayTasks}`);
  log.info(`Realm Path ${realm.path}`);
  return (
    <SafeAreaView>
      <ExplosionContext.Provider
        value={() => {
          if (nuttable) cannonRef.current?.start();
        }}
      >
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
}: {
  date: Date;
  setDate: (date: Date) => void;
}) {
  const tasks = useQuery(Task).filtered("startsOn <= $0", date);
  const todayTasks = tasks.filter((a) => a.showToday(date));

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
          <SettingsButton />
        </View>
      </CardHeader>
      <CardContent>
        <CalendarSection date={date} setDate={setDate} />
      </CardContent>
    </View>
  );
}
