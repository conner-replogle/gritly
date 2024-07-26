import { Plus } from "lucide-react-native";
import {
  LayoutAnimation,
  Modal,
  NativeSyntheticEvent,
  Pressable,
  SafeAreaView,
  ScrollView,
  TextInput,
  TextInputFocusEventData,
  TextInputProps,
  View,
} from "react-native";

import { cn } from "~/lib/utils";
import { Text } from "../ui/text";

import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { Button } from "../ui/button";
import { useRealm } from "@realm/react";
import { CALENDAR, Goal, Repeat, Task, UNITS } from "~/lib/states/task";

import { useContext, useMemo, useRef, useState } from "react";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { useTheme } from "@react-navigation/native";
import { Handle } from "./customhandle";

import {
  EditTaskScreen,
  SWATCHES_COLORS,
} from "~/components/Task/EditTaskScreen";
import { SubscriptionContext } from "~/lib/config";

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

function getRandomBrightColor(): string {
  return SWATCHES_COLORS[Math.floor(Math.random() * SWATCHES_COLORS.length)];
}

function AddTaskSheet({
  bottomSheetModalRef,
}: {
  bottomSheetModalRef: React.RefObject<BottomSheetModalMethods>;
}) {
  const realm = useRealm();
  const { colors } = useTheme();
  const [newTask, setNewTask] = useState<Task>(
    Task.generate("", "", getRandomBrightColor())
  );

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
          onSubmit={(task) => {
            if (realm.isInTransaction) realm.cancelTransaction();
            realm.write(() => {
              realm.create("Task", task);
            });
            setNewTask(Task.generate("", "", getRandomBrightColor()));
            bottomSheetModalRef.current?.dismiss();
            bottomSheetModalRef.current?.forceClose();
          }}
        />
      </BottomSheetView>
    </BottomSheetModal>
  );
}
