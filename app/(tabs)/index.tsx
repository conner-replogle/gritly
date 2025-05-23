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

import { AddHabits } from "~/components/AddHabit/AddHabits";

import { Button } from "~/components/ui/button";

import { CalendarSection } from "~/components/Calendar/Calendar";

import HabitContent from "~/components/Habit/habit";
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
import { DateContext, ExplosionContext, log } from "~/lib/config";
import { DropdownMenuTriggerRef } from "@rn-primitives/dropdown-menu";
import useHabits, { useHabitsWithCompleted } from "~/lib/hooks/Habits";
import { Habit } from "~/models/Habit";
import { endOfDay, startOfDay } from "date-fns";
import { withObservables } from "@nozbe/watermelondb/react";
import { of as of$ } from "rxjs";
import { useTheme } from "@react-navigation/native";

const ObservableHabit = withObservables(
  ["habit", "completed"],
  ({ habit, completed }) => ({
    habit: habit.observe(),
    completed: completed ? completed.observe() : of$(null),
  })
)(HabitContent);
export default function Screen() {
  const [date, setInnerDate] = React.useState(startOfDay(Date.now()));
  const storage = useMMKV();
  const setDate = useCallback((date: Date) => {
    setInnerDate(startOfDay(date));
  }, []);
  const [nuttable, _] = useMMKVBoolean("settings.nuttable");

  const cannonRef = useRef<ConfettiCannon>(null);

  return (
    <SafeAreaView>
      <DateContext.Provider
        value={{
          date,
          setDate,
        }}
      >
        <ExplosionContext.Provider
          value={() => {
            if (nuttable) {
              cannonRef.current?.start();
            }
          }}
        >
          <View className="h-[100vh] bg-secondary/50">
            <HeaderCard date={date} setDate={setDate} />

            <View className="p-6 flex flex-col gap-4 h-full">
              <ListCard date={date} />
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
      </DateContext.Provider>
    </SafeAreaView>
  );
}

function ListCard({ date }: { date: Date }) {
  let [showAll, setShowAll] = useState(false);
  const habits = useHabitsWithCompleted(date);
  if (habits === undefined) {
    return <Text>Loading...</Text>;
  }
  console.log(habits);
  let completed = habits.filter(
    (a) => a.completed?.isCompleted || a.completed?.skipped
  );
  let not_completed = habits.filter(
    (a) => !a.completed?.isCompleted && !a.completed?.skipped
  );
  return (
    <>
      <View className="flex-row justify-between items-center">
        <Text className="font-semibold text-lg">Habits</Text>
        <Button size="sm" variant={"link"} onPress={() => setShowAll(!showAll)}>
          {showAll && (
            <Text className="text-xs text-blue-700 font-bold">ALL</Text>
          )}
          {!showAll && (
            <Text className="text-xs text-blue-700 font-bold">ACTIVE</Text>
          )}
        </Button>
      </View>
      {!showAll && not_completed.length == 0 && (
        <View className="h-24 rounded-3xl bg-secondary justify-center items-center">
          <Text className="font-semibold text-lg">
            All your habits for today are completed.
          </Text>
        </View>
      )}
      <FlatList
        data={[...not_completed, ...(showAll ? completed : [])]}
        renderItem={({ item }) => (
          <ObservableHabit
            date={date}
            habit={item.habit}
            completed={item.completed}
            interactive={date <= endOfDay(Date.now())}
          />
        )}
      />
    </>
  );
}

function HeaderCard({
  date,
  setDate,
}: {
  date: Date;
  setDate: (date: Date) => void;
}) {
  const { colors } = useTheme();
  const tiggerRef = useRef<DropdownMenuTriggerRef>(null);
  return (
    <View className="bg-background">
      <CardHeader className="flex flex-row justify-between  items-start">
        <View>
          <CardTitle className="text-start">
            {date.toLocaleString("en-US", {
              year: "numeric",
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
      <CardContent className="min-h-24">
        <CalendarSection />
      </CardContent>
    </View>
  );
}
