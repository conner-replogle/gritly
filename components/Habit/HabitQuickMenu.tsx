import * as React from "react";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
} from "~/components/ui/dropdown-menu";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  EditIcon,
  LineChart,
  PauseIcon,
  Redo2,
  Trash,
} from "lucide-react-native";
import { Link } from "expo-router";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { EditableHabit, Habit } from "~/models/Habit";
import { useTheme } from "@react-navigation/native";
import { EditHabitScreen } from "~/components/Habit/EditHabitScreen";
import { Pressable, View } from "react-native";
import { Text } from "~/components/ui/text";
import { useDatabase } from "@nozbe/watermelondb/hooks";
import { ProgressMeterWithIcon } from "~/components/Habit/habitCard";
import { Completed } from "~/models/Completed";
import { useContext } from "react";
import { DateContext, ExplosionContext, log } from "~/lib/config";

export function EditBottomSheet(props: {
  bottomSheetRef: React.RefObject<BottomSheetModal>;

  onDelete: () => Promise<void>;
  onSubmit: (ahabit: EditableHabit) => Promise<void>;
  habit: EditableHabit;
}) {
  const { colors } = useTheme();
  return (
    <BottomSheetModal
      ref={props.bottomSheetRef}
      snapPoints={["90%"]}
      handleIndicatorStyle={{
        backgroundColor: colors.border,
      }}
      backgroundStyle={{
        backgroundColor: colors.background,
      }}
    >
      <BottomSheetView>
        <EditHabitScreen
          onDelete={props.onDelete}
          submitLabel="Save"
          onSubmit={props.onSubmit}
          nhabit={props.habit}
        />
      </BottomSheetView>
    </BottomSheetModal>
  );
}

export function HabitQuickMenu({
  habit,
  completed,
  interactive,
  close,
}: {
  habit: Habit;
  completed?: Completed;
  interactive: boolean;
  close: () => void;
}) {
  const { colors } = useTheme();
  const nut = useContext(ExplosionContext);
  const { date, setDate } = useContext(DateContext);
  const editSheetRef = React.useRef<BottomSheetModal>(null);
  const database = useDatabase();

  let total = completed?.total ?? 0;
  let outof = completed?.goal.amount ?? habit.goal.amount;
  return (
    <View className="p-5 h-full">
      <View className=" gap-3 flex-row px-5">
        <Text className="text-3xl font-semibold mr-auto">{habit.title}</Text>
      </View>
      <View className="flex-row w-full justify-center items-center">
        <Pressable
          disabled={!interactive}
          onPress={async () => {
            if (completed) {
              await completed.uncomplete();
            }
          }}
        >
          <ChevronLeft color={interactive ? habit.color : "gray"} size={64} />
        </Pressable>
        <ProgressMeterWithIcon
          completed={completed}
          habit={habit}
          strokeWidth={6}
          radius={64}
        />

        <Pressable
          disabled={!interactive}
          onPress={async () => {
            if (completed?.isCompleted ?? false) {
              return;
            }
            log.debug("Completing habit");
            if (completed) {
              log.debug(
                `Adding ${habit.goal.steps} steps to ${completed.total}`
              );
              await completed.complete(date);
              if (completed.isCompleted) {
                nut();
              }
            } else {
              log.debug("Creating new completed");
              await habit.createCompleted(date);
            }
          }}
        >
          <ChevronRight color={interactive ? habit.color : "gray"} size={64} />
        </Pressable>
      </View>

      <View className="flex-row justify-center">
        <Text className="text-xl font-bold">
          {total}/{outof} {habit.goal.unit}
        </Text>
      </View>
      <View className="flex-row mt-auto mb-10 px-5 justify-between">
        <Link
          href={`/analytics?habit_id=${habit.id}`}
          onPress={() => {
            close();
          }}
          asChild
        >
          <Pressable>
            <LineChart size={32} color={colors.primary} />
          </Pressable>
        </Link>
        <Pressable
          onPress={() => {
            editSheetRef.current?.present();
          }}
        >
          <EditIcon size={32} color={colors.primary} />
        </Pressable>
      </View>

      <EditBottomSheet
        bottomSheetRef={editSheetRef}
        onDelete={async () => {
          await database.write(async () => {
            await habit.markAsDeleted();
          });
          editSheetRef.current?.close();
        }}
        onSubmit={async (ahabit) => {
          // @ts-ignore
          await database.write(async () => {
            await habit.update((a) => {
              a.title = ahabit.title;
              a.goal = ahabit.goal;
              a.icon = ahabit.icon;
              a.repeats = ahabit.repeats;
              a.startsOn = ahabit.startsOn;
              a.description = ahabit.description;
              a.color = ahabit.color;
            });
          });

          editSheetRef.current?.close();
        }}
        habit={habit.toEditableHabit()}
      />
    </View>
  );
}
