import { LayoutAnimation, View } from "react-native";

import { Text } from "../ui/text";

import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { Button } from "../ui/button";

import { useContext, useMemo, useRef, useState } from "react";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { useTheme } from "@react-navigation/native";
import { Handle } from "./customhandle";

import {
  EditTaskScreen,
  SWATCHES_COLORS,
} from "~/components/Task/EditTaskScreen";
import { log, SubscriptionContext } from "~/lib/config";
import { EditableTask, GenerateTask, Task } from "~/models/Task";
import { useDatabase } from "@nozbe/watermelondb/hooks";
import { TableName } from "~/models/schema";

export function AddTasks(props: { dense?: boolean }) {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const subscription = useContext(SubscriptionContext);
  return (
    <View>
      <AddTaskSheet bottomSheetModalRef={bottomSheetModalRef} />

      <Button
        onPress={() => {
          bottomSheetModalRef.current?.present();
        }}
      >
        <Text>Add Task</Text>
      </Button>
    </View>
  );
}

function AddTaskSheet({
  bottomSheetModalRef,
}: {
  bottomSheetModalRef: React.RefObject<BottomSheetModalMethods>;
}) {
  const database = useDatabase();

  const { colors } = useTheme();
  const [newTask, setNewTask] = useState<EditableTask>(GenerateTask());

  // variables
  const snapPoints = ["90%"];

  return (
    <BottomSheetModal
      handleHeight={5}
      ref={bottomSheetModalRef}
      keyboardBehavior="interactive"
      snapPoints={snapPoints}
      handleIndicatorStyle={{
        backgroundColor: colors.border,
      }}
      backgroundStyle={{
        backgroundColor: colors.background,
      }}
      onAnimate={(_, index) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }}
    >
      <BottomSheetView>
        <EditTaskScreen
          submitLabel="Create"
          task={newTask}
          onSubmit={async (task) => {
            await database.write(async () => {
              await database.get<Task>(TableName.TASKS).create((newTask) => {
                newTask.title = task.title;
                newTask.goal = task.goal;
                newTask.color = task.color;
                newTask.repeats = task.repeats;
                newTask.startsOn = task.startsOn;
                newTask.description = task.description;
              });
            });
            log.debug(`Created Task ${task.title}`);

            setNewTask(GenerateTask());
            bottomSheetModalRef.current?.forceClose();
          }}
        />
      </BottomSheetView>
    </BottomSheetModal>
  );
}
