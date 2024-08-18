import { Text } from "~/components/ui/text";
import useHabits from "~/lib/hooks/Habits";
import { HabitCard } from "~/components/Habit/habitCard";
import { FlatList, Pressable, ScrollView, View } from "react-native";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { log } from "~/lib/config";
import {
  EditIcon,
  LineChart,
  PauseIcon,
  Redo2,
  Trash,
} from "lucide-react-native";
import * as React from "react";
import { Habit } from "~/models/Habit";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useDatabase } from "@nozbe/watermelondb/hooks";
import { addDays } from "date-fns";
import { Link } from "expo-router";
import HabitContent from "~/components/Habit/habit";

export default function Habits() {
  const habits = useHabits();

  return (
    <View className="p-5 h-full">
      <FlatList
        className={"flex-1"}
        data={habits}
        renderItem={({ item }) => {
          return (
            <HabitContent
              habit={item}
              date={new Date(Date.now())}
              interactive={false}
            />
          );
        }}
      />
    </View>
  );
}
