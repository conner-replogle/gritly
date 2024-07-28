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
import { Completed, Task } from "~/lib/states/task";
import { useObject, useRealm } from "@realm/react";
import { EditIcon, LineChart, Redo2 } from "lucide-react-native";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useTheme } from "@react-navigation/native";
import { UpdateMode } from "realm";
import { EditTaskScreen } from "~/components/Task/EditTaskScreen";
import { TaskCard } from "~/components/Task/taskCard";
import { ExplosionContext, log } from "~/lib/config";
import { ObjectId } from "bson";
import { RealmSet } from "realm/dist/Set";

function useTaskAndCompleted(
  task_id: ObjectId,
  date: Date
): [Task | null, Completed | undefined] {
  const task = useObject(Task, task_id);
  log.debug("Task Changed");
  const completed = task?.getCompleted(date);

  return [task, completed];
}

export default function TaskContent({
  task_id,
  date,
}: {
  task_id: Realm.BSON.ObjectId;
  date: Date;
}) {
  const { colors } = useTheme();
  const [task, completed] = useTaskAndCompleted(task_id, date);
  const realm = useRealm();
  if (!task) {
    return <Text>Task not found</Text>;
  }
  const menuRef = React.useRef(null);
  const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);
  const snapPoints = React.useMemo(() => ["90%"], []);

  const completable = date <= new Date(Date.now());

  const streak = task.getStreak(date);

  const nut = useContext(ExplosionContext);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Pressable>
          <TaskCard
            task={task}
            streak={streak}
            completable={completable}
            completed={completed}
            onCompletePress={() => {
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
              realm.write(() => {
                if (completed) {
                  log.debug(
                    `Adding to completed ${completed.amount} by ${completed.goal.steps} ${completed.completedAt} `
                  );
                  completed.completedAt.push(date);
                  log.debug(`New Completed At ${completed.completedAt}`);
                  completed.amount += completed.goal.steps;

                  if (completed.amount >= completed.goal.amount) {
                    log.debug("Confetti Activating");
                    nut();
                  }
                } else {
                  task.completed.push({
                    _id: new Realm.BSON.ObjectId(),
                    completedAt: [date],
                    amount: task.goal.steps,
                    goal: {
                      ...task.goal,
                    },
                  } as unknown as Completed);
                  if (task.goal.steps >= task.goal.amount) {
                    nut();
                  }
                }
              }); //completed={item.completed[item.completed.length].goal}
            }}
            onCompleteLongPress={() => {
              log.debug("long press");
              realm.write(() => {
                if (completed) {
                  if (completed.amount <= task.goal?.steps) {
                    log.debug(`deleting ${completed.completedAt}`);
                    realm.delete(completed);
                    return;
                  }
                  log.debug(
                    `substracting ${task.goal?.steps} from ${completed.amount}`
                  );
                  completed.amount -= task.goal?.steps;
                  if (task.repeats.period !== "Daily") {
                    completed.completedAt.pop();
                  }
                } else {
                  log.debug("adding");
                  task.completed.push({
                    _id: new Realm.BSON.ObjectId(),
                    completedAt: [date],
                    amount: task.goal.amount,
                    goal: {
                      ...task.goal,
                    },
                  });
                }
              });
            }}
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
            onPress={() => {
              realm.write(() => {
                let completed = task.getCompleted(date);
                if (completed) {
                  log.debug("deleting completed");
                  realm.delete(completed);
                }
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
            onDelete={() => {
              if (realm.isInTransaction) {
                realm.cancelTransaction();
              }
              realm.write(() => {
                realm.delete(task);
              });
              bottomSheetModalRef.current?.dismiss();
            }}
            submitLabel="Save"
            onSubmit={(atask) => {
              // @ts-ignore
              delete atask["completed"];
              realm.commitTransaction();
              bottomSheetModalRef.current?.dismiss();
            }}
            task={task}
          />
        </BottomSheetView>
      </BottomSheetModal>
    </DropdownMenu>
  );
}
