import { Text } from "~/components/ui/text";
import { SettingsSheet } from "~/components/Settings/Settings";
import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "react-native";
import { Calendar } from "react-native-calendars";
import { useTheme } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import useHabits from "~/lib/hooks/Habits";
import { Habit } from "~/models/Habit";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { WeeklyContent, WeeklyHeader } from "~/components/Analytics/Weekly";
import * as React from "react";
import { AnalyticsScreen } from "~/components/Analytics/AnalyticsScreen";

enum AnalyticsType {
  weekly = "weekly",
  monthly = "monthly",
  all_time = "all_time",
}

export default function Analytics() {
  const { colors } = useTheme();
  const habits = useHabits();
  const { habit_id } = useLocalSearchParams<{ habit_id?: string }>();
  const [habit, setHabit] = useState<Habit | undefined>(undefined);

  useEffect(() => {
    if (habit_id) {
      let target_habit = habits.find((a) => a.id === habit_id);
      setHabit(target_habit);
    }
  }, [habit_id]);

  return (
    <SafeAreaView>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 15,
        }}
      >
        <Text className="font-bold text-3xl">Analytics</Text>
        <SelectHabit
          habits={habits}
          selected={
            habit
              ? { value: habit?.id, label: habit?.title }
              : { value: "all", label: "All Habits" }
          }
          setSelected={(option) => {
            // @ts-ignore
            if (option?.value === "all") {
              setHabit(undefined);
              return;
            }
            let habit = habits.find((a) => a.id === option?.value);
            setHabit(habit);
          }}
        />
      </View>
      <AnalyticsScreen habit={habit} />
    </SafeAreaView>
  );
}

function SelectHabit({
  habits,
  selected,
  setSelected,
}: {
  habits: Habit[];
  selected: { value: string; label: string } | undefined;
  setSelected: (option: { value: string; label: string } | undefined) => void;
}) {
  return (
    <Select
      value={selected}
      onValueChange={setSelected}
      defaultValue={{ value: "all", label: "All Habits" }}
    >
      <SelectTrigger className="w-[150px]">
        <SelectValue
          className="text-foreground text-sm native:text-lg"
          placeholder="Select a habit"
        />
      </SelectTrigger>
      <SelectContent className="w-[250px]">
        <SelectGroup>
          <SelectLabel>Habits</SelectLabel>
          <SelectItem label="All Habits" value="all">
            All Habits
          </SelectItem>
          {habits.map((habit) => (
            <SelectItem key={habit.id} value={habit.id} label={habit.title}>
              {habit.title}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
