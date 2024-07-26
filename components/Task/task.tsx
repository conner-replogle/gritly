import * as React from "react";
import { FlatList, Pressable, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import uuid from "react-native-uuid";
import { Text } from "~/components/ui/text";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Completed, Task } from "~/lib/states/task";

import Svg, { Circle, Path } from "react-native-svg";
import { useObject, useRealm } from "@realm/react";
import { CheckIcon, PlusIcon } from "lucide-react-native";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useTheme } from "@react-navigation/native";
import { UpdateMode } from "realm";
import { EditTaskScreen } from "~/components/Task/EditTaskScreen";
import { TaskCard } from "~/components/Task/taskCard";
import { useContext } from "react";
import { ExplosionContext } from "~/lib/config";
import { Button } from "~/components/ui/button";

export default function TaskContent({
  task_id,
  date,
}: {
  task_id: Realm.BSON.ObjectId;
  date: Date;
}) {
  const { colors } = useTheme();

  const realm = useRealm();
  const task = useObject(Task, task_id);
  if (!task) {
    return <Text>Task not found</Text>;
  }
  const menuRef = React.useRef(null);
  const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);
  const snapPoints = React.useMemo(() => ["90%"], []);

  const completable = date <= new Date(Date.now());
  const completed = task.getCompleted(date);
  const streak = task.getStreak(date);

  const nut = useContext(ExplosionContext);
  return (
    <>
      <Pressable
        onPress={() => {
          bottomSheetModalRef.current?.present();
        }}
      >
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
                completed.amount += completed.goal.steps;

                completed.completedAt = [...completed.completedAt, date];
                if (completed.amount >= completed.goal.amount) {
                  console.log("nut");
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
                } as Completed);
                if (task.goal.steps >= task.goal.amount) {
                  nut();
                }
              }
            }); //completed={item.completed[item.completed.length].goal}
          }}
          onCompleteLongPress={() => {
            console.log("long press");
            realm.write(() => {
              if (completed) {
                if (completed.amount <= task.goal?.steps) {
                  realm.delete(completed);
                  return;
                }
                completed.amount -= task.goal?.steps;
                completed.completedAt = completed.completedAt.slice(0, -1);
              } else {
                task.completed.push({
                  _id: new Realm.BSON.ObjectId(),
                  completedAt: [date],
                  amount: task.goal.amount,
                  goal: {
                    ...task.goal,
                  },
                } as Completed);
              }
            });
          }}
        />
      </Pressable>
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
              console.log(atask);
              realm.commitTransaction();
              bottomSheetModalRef.current?.dismiss();
            }}
            task={task}
          />
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
}
