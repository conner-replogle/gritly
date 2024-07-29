import * as React from "react";
import { useContext } from "react";
import { Pressable } from "react-native";
import { Text } from "~/components/ui/text";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { of as of$ } from "rxjs";

import { EditIcon, LineChart, Redo2 } from "lucide-react-native";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useTheme } from "@react-navigation/native";
import { EditTaskScreen } from "~/components/Task/EditTaskScreen";
import { TaskCard } from "~/components/Task/taskCard";
import { ExplosionContext, log } from "~/lib/config";
import { Task } from "~/models/Task";
import { useCompleted } from "~/components/hooks/Tasks";
import { useDatabase } from "@nozbe/watermelondb/hooks";
import { withObservables } from "@nozbe/watermelondb/react";

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
  const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);
  const snapPoints = React.useMemo(() => ["90%"], []);

  const completable = date <= new Date(Date.now());

  const nut = useContext(ExplosionContext);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Pressable>
          <EnhancedTask
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
              if (completed && completed.isCompleted()) {
                return;
              }
              log.debug("Completing task");
              if (completed) {
                log.debug(
                  `Adding ${completed.goal.steps} steps to ${completed.amount}`
                );
                await completed.complete(completed.goal.steps, date);
                if (completed.amount >= completed.goal.amount) {
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
              bottomSheetModalRef.current?.present();
            }}
          >
            <EditIcon size={16} />
            <DropdownMenuLabel>Edit</DropdownMenuLabel>
          </DropdownMenuItem>
          <DropdownMenuItem onPress={() => {}}>
            <LineChart size={16} />
            <DropdownMenuLabel>Analytics</DropdownMenuLabel>
          </DropdownMenuItem>
          <DropdownMenuItem
            onPress={async () => {
              await database.write(async () => {
                completed?.markAsDeleted();
              });
            }}
          >
            <Redo2 size={16} />
            <DropdownMenuLabel>Reset</DropdownMenuLabel>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        snapPoints={snapPoints}
        handleIndicatorStyle={{
          backgroundColor: colors.border,
        }}
        backgroundStyle={{
          backgroundColor: colors.background,
        }}
      >
        <BottomSheetView>
          <EditTaskScreen
            onDelete={async () => {
              await task.markAsDeleted();
              bottomSheetModalRef.current?.dismiss();
            }}
            submitLabel="Save"
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

              bottomSheetModalRef.current?.dismiss();
            }}
            task={task.toEditableTask()}
          />
        </BottomSheetView>
      </BottomSheetModal>
    </DropdownMenu>
  );
}

const enhance = withObservables(["completed"], ({ completed }) => ({
  completed: completed ? completed.observe() : of$(undefined),
}));

const EnhancedTask = enhance(TaskCard);
