import * as React from "react";
import { useContext } from "react";
import { Pressable } from "react-native";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import {
  EditIcon,
  LineChart,
  PauseIcon,
  Redo2,
  Trash,
} from "lucide-react-native";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useTheme } from "@react-navigation/native";
import { EditHabitScreen } from "~/components/Habit/EditHabitScreen";
import { HabitCard } from "~/components/Habit/habitCard";
import { ExplosionContext, log } from "~/lib/config";
import { EditableHabit, Habit } from "~/models/Habit";
import { useDatabase } from "@nozbe/watermelondb/hooks";
import { AnalyticsScreen } from "~/components/Analytics/AnalyticsScreen";
import { addDays } from "date-fns";
import { Completed } from "~/models/Completed";
import { Link } from "expo-router";
import { HabitQuickMenu } from "~/components/Habit/HabitQuickMenu";

export function QuickMenuBottomSheet(props: {
  bottomSheetRef: React.RefObject<BottomSheetModal>;
  completed?: Completed;
  habit: Habit;
}) {
  const { colors } = useTheme();
  return (
    <BottomSheetModal
      ref={props.bottomSheetRef}
      snapPoints={["40%"]}
      handleIndicatorStyle={{
        backgroundColor: colors.border,
      }}
      backgroundStyle={{
        backgroundColor: colors.background,
      }}
    >
      <BottomSheetView>
        <HabitQuickMenu
          completed={props.completed}
          habit={props.habit}
          close={() => {
            props.bottomSheetRef.current?.dismiss();
          }}
        />
      </BottomSheetView>
    </BottomSheetModal>
  );
}

export default function HabitContent({
  habit,
  completed,
  date,
}: {
  habit: Habit;
  completed?: Completed;
  date: Date;
}) {
  const { colors } = useTheme();
  const menuBottomRef = React.useRef<BottomSheetModal>(null);

  const completable = date <= new Date(Date.now());
  const nut = useContext(ExplosionContext);
  return (
    <Pressable
      onPress={() => {
        menuBottomRef.current?.present();
      }}
    >
      <HabitCard
        habit={habit}
        streak={0}
        completable={completable}
        completed={completed}
        onCompletePress={async () => {
          if (completed?.isCompleted ?? false) {
            return;
          }
          log.debug("Completing habit");
          if (completed) {
            log.debug(`Adding ${habit.goal.steps} steps to ${completed.total}`);
            await completed.complete(date);
            if (completed.isCompleted) {
              nut();
            }
          } else {
            log.debug("Creating new completed");
            await habit.createCompleted(date);
          }
        }}
        onCompleteLongPress={() => {}}
      />
      <QuickMenuBottomSheet
        completed={completed}
        bottomSheetRef={menuBottomRef}
        habit={habit}
      />
    </Pressable>
  );
}
