import * as React from "react";
import { FlatList, Pressable, View } from "react-native";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import uuid from "react-native-uuid";
import { Text } from "~/components/ui/text";
import { CardDescription, CardTitle } from "~/components/ui/card";

import { Completed, Task } from "~/lib/states/task";

import Svg, { Circle, Path } from "react-native-svg";
import { useObject, useRealm } from "@realm/react";
import { CheckIcon, PlusIcon } from "lucide-react-native";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useTheme } from "@react-navigation/native";
import { UpdateMode } from "realm";
import { EditTaskScreen } from "~/components/Task/EditTaskScreen";
import { TaskCard } from "~/components/Task/taskCard";

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
  const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);
  const snapPoints = React.useMemo(() => ["90%"], []);

  const completable = date <= new Date(Date.now());
  const completed = task.getCompleted(date);
  const streak = task.getStreak(date);
  return (
    <>
      <TaskCard
        task={task}
        streak={streak}
        completable={completable}
        completed={completed}
        onCardPress={() => {
          bottomSheetModalRef.current?.present();
        }}
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
            } else {
              task.completed.push({
                _id: new Realm.BSON.ObjectId(),
                completedAt: date,
                amount: task.goal.steps,
                goal: {
                  ...task.goal,
                },
              } as Completed);
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
            } else {
              task.completed.push({
                _id: new Realm.BSON.ObjectId(),
                completedAt: date,
                amount: task.goal.amount,
                goal: {
                  ...task.goal,
                },
              } as Completed);
            }
          });
        }}
      />
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
