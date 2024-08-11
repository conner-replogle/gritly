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
import { AnalyicsBottomSheet, EditBottomSheet } from "~/components/Habit/habit";
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
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Pressable>
          <HabitCard
            habit={habit}
            completed={undefined}
            streak={0}
            completable={true}
            onCompletePress={() => {}}
            onCompleteLongPress={() => {}}
          />
        </Pressable>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {/* Drop Down Menu For habit with edit delete reset options */}

        <DropdownMenuGroup>
          <DropdownMenuItem
            onPress={() => {
              editSheetRef.current?.present();
            }}
          >
            <EditIcon size={16} />
            <DropdownMenuLabel>Edit</DropdownMenuLabel>
          </DropdownMenuItem>
          <Link href={`/analytics?habit_id=${habit.id}`} asChild>
            <DropdownMenuItem onPress={() => {}}>
              <LineChart size={16} />
              <DropdownMenuLabel>Analytics</DropdownMenuLabel>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem
            onPress={async () => {
              await habit.endHabit(new Date(Date.now()));
            }}
          >
            <PauseIcon size={16} />
            <DropdownMenuLabel>End Habit</DropdownMenuLabel>
          </DropdownMenuItem>
          <DropdownMenuItem
            onPress={async () => {
              await database.write(async () => {
                await habit.markAsDeleted();
              });
            }}
          >
            <Trash size={16} />
            <DropdownMenuLabel>Delete Habit</DropdownMenuLabel>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
      <EditBottomSheet
        bottomSheetRef={editSheetRef}
        onDelete={async () => {
          await database.write(async () => {
            await habit.markAsDeleted();
          });
          editSheetRef.current?.dismiss();
        }}
        onSubmit={async (ahabit) => {
          // @ts-ignore
          await database.write(async () => {
            await habit.update((a) => {
              a.title = ahabit.title;
              a.goal = ahabit.goal;
              a.repeats = ahabit.repeats;
              a.startsOn = ahabit.startsOn;
              a.description = ahabit.description;
              a.color = ahabit.color;
            });
          });

          editSheetRef.current?.dismiss();
        }}
        habit={habit.toEditableHabit()}
      />
    </DropdownMenu>
  );
}
