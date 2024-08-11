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

export function AnalyicsBottomSheet(props: {
  bottomSheetRef: React.RefObject<BottomSheetModal>;
  habit: Habit;
}) {
  const { colors } = useTheme();
  return (
    <BottomSheetModal
      ref={props.bottomSheetRef}
      snapPoints={["95%"]}
      handleIndicatorStyle={{
        backgroundColor: colors.border,
      }}
      backgroundStyle={{
        backgroundColor: colors.background,
      }}
    >
      <BottomSheetView>
        <AnalyticsScreen habit={props.habit} />
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
  const database = useDatabase();

  const { colors } = useTheme();
  const editSheetRef = React.useRef<BottomSheetModal>(null);

  const analyticalSheetRef = React.useRef<BottomSheetModal>(null);

  const completable = date <= new Date(Date.now());
  const nut = useContext(ExplosionContext);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Pressable>
          <HabitCard
            habit={habit}
            streak={0}
            completable={completable}
            completed={completed}
            onCompletePress={async () => {
              const today = new Date(date);
              date.setHours(
                today.getHours(),
                today.getMinutes(),
                today.getSeconds(),
                0
              );
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
          {completed?.skipped && (
            <DropdownMenuItem
              onPress={async () => {
                await completed?.unskip();
              }}
            >
              <Redo2 size={16} />
              <DropdownMenuLabel>Unskip</DropdownMenuLabel>
            </DropdownMenuItem>
          )}
          {!completed?.skipped && (
            <DropdownMenuItem
              onPress={async () => {
                await habit.skip(date);
              }}
            >
              <LineChart size={16} />
              <DropdownMenuLabel>Skip</DropdownMenuLabel>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onPress={async () => {
              await database.write(async () => {
                await completed?.destroyPermanently();
              });
            }}
          >
            <Redo2 size={16} />
            <DropdownMenuLabel>Reset</DropdownMenuLabel>
          </DropdownMenuItem>
          <DropdownMenuItem
            onPress={async () => {
              await habit.endHabit(addDays(date, 1));
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
      <AnalyicsBottomSheet bottomSheetRef={analyticalSheetRef} habit={habit} />
    </DropdownMenu>
  );
}
