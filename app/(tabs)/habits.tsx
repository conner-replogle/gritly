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

export default function Habits() {
  const habits = useHabits();

  return (
    <View className="p-5 h-full">
      <FlatList
        className={"flex-1"}
        data={habits}
        renderItem={({ item }) => {
          return <HabitCardWithDropdown habit={item} />;
        }}
      />
    </View>
  );
}

function HabitCardWithDropdown({ habit }: { habit: Habit }) {
  const editSheetRef = React.useRef<BottomSheetModal>(null);

  const snapPoints = React.useMemo(() => ["90%"], []);
  const database = useDatabase();
  return <h1>tTODo</h1>;
}
