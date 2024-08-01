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
import { EditTaskScreen } from "~/components/Task/EditTaskScreen";
import { TaskCard } from "~/components/Task/taskCard";
import { ExplosionContext, log } from "~/lib/config";
import { EditableTask, Task } from "~/models/Task";
import { useCompleted } from "~/components/hooks/Tasks";
import { useDatabase } from "@nozbe/watermelondb/hooks";
import { PortalHost } from "~/components/primitives/portal";
import { AnalyticsScreen } from "~/components/Analytics/AnalyticsScreen";
import { addDays } from "date-fns";

export function EditBottomSheet(props: {
  bottomSheetRef: React.RefObject<BottomSheetModal>;
  snapPoints: string[];

  onDelete: () => Promise<void>;
  onSubmit: (atask: EditableTask) => Promise<void>;
  task: EditableTask;
}) {
  const { colors } = useTheme();
  return (
    <BottomSheetModal
      ref={props.bottomSheetRef}
      snapPoints={props.snapPoints}
      handleIndicatorStyle={{
        backgroundColor: colors.border,
      }}
      backgroundStyle={{
        backgroundColor: colors.background,
      }}
    >
      <BottomSheetView>
        <EditTaskScreen
          onDelete={props.onDelete}
          submitLabel="Save"
          onSubmit={props.onSubmit}
          task={props.task}
        />
      </BottomSheetView>
    </BottomSheetModal>
  );
}

export function AnalyicsBottomSheet(props: {
  bottomSheetRef: React.RefObject<BottomSheetModal>;
  snapPoints: string[];
  task: Task;
}) {
  const { colors } = useTheme();
  return (
    <BottomSheetModal
      ref={props.bottomSheetRef}
      snapPoints={props.snapPoints}
      handleIndicatorStyle={{
        backgroundColor: colors.border,
      }}
      backgroundStyle={{
        backgroundColor: colors.background,
      }}
    >
      <BottomSheetView>
        <AnalyticsScreen task={props.task} />
      </BottomSheetView>
    </BottomSheetModal>
  );
}

export default function TaskContent({
  task,
  date,
}: {
  task: Task;
  date: Date;
}) {
  const database = useDatabase();

  const completed = useCompleted(task, date);

  const { colors } = useTheme();
  const editSheetRef = React.useRef<BottomSheetModal>(null);

  const analyticalSheetRef = React.useRef<BottomSheetModal>(null);
  const snapPoints = React.useMemo(() => ["90%"], []);

  const completable = date <= new Date(Date.now());

  const nut = useContext(ExplosionContext);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Pressable>
          <TaskCard
            task={task}
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
              if (completed.isCompleted) {
                return;
              }
              log.debug("Completing task");
              if (completed) {
                log.debug(
                  `Adding ${task.goal.steps} steps to ${completed.total}`
                );
                await task.createCompleted(date);
                if (completed.total + task.goal.steps >= task.goal.amount) {
                  nut();
                }
              } else {
                log.debug("Creating new completed");
                await task.createCompleted(date);
              }
            }}
            onCompleteLongPress={() => {}}
          />
        </Pressable>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {/* Drop Down Menu For task with edit delete reset options */}

        <DropdownMenuGroup>
          <DropdownMenuItem
            onPress={() => {
              editSheetRef.current?.present();
            }}
          >
            <EditIcon size={16} />
            <DropdownMenuLabel>Edit</DropdownMenuLabel>
          </DropdownMenuItem>
          <DropdownMenuItem
            onPress={() => {
              analyticalSheetRef.current?.present();
            }}
          >
            <LineChart size={16} />
            <DropdownMenuLabel>Analytics</DropdownMenuLabel>
          </DropdownMenuItem>
          <DropdownMenuItem
            onPress={async () => {
              await database.write(async () => {
                for (let a of completed.completed) {
                  await a.destroyPermanently();
                }
              });
            }}
          >
            <Redo2 size={16} />
            <DropdownMenuLabel>Reset</DropdownMenuLabel>
          </DropdownMenuItem>
          <DropdownMenuItem
            onPress={async () => {
              await task.endTask(addDays(date, 1));
            }}
          >
            <PauseIcon size={16} />
            <DropdownMenuLabel>End Task</DropdownMenuLabel>
          </DropdownMenuItem>
          <DropdownMenuItem
            onPress={async () => {
              await database.write(async () => {
                await task.markAsDeleted();
              });
            }}
          >
            <Trash size={16} />
            <DropdownMenuLabel>Delete Task</DropdownMenuLabel>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
      <EditBottomSheet
        bottomSheetRef={editSheetRef}
        snapPoints={snapPoints}
        onDelete={async () => {
          await database.write(async () => {
            await task.markAsDeleted();
          });
          editSheetRef.current?.dismiss();
        }}
        onSubmit={async (atask) => {
          // @ts-ignore
          await database.write(async () => {
            await task.update((a) => {
              a.title = atask.title;
              a.goal = atask.goal;
              a.repeats = atask.repeats;
              a.startsOn = atask.startsOn;
              a.description = atask.description;
              a.color = atask.color;
            });
          });

          editSheetRef.current?.dismiss();
        }}
        task={task.toEditableTask()}
      />
      <AnalyicsBottomSheet
        bottomSheetRef={analyticalSheetRef}
        snapPoints={snapPoints}
        task={task}
      />
    </DropdownMenu>
  );
}
