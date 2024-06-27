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

import { useMemo, useRef, useState } from "react";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { useTheme } from "@react-navigation/native";
import { Handle } from "./customhandle";

import { EditTaskScreen } from "~/components/Task/EditTaskScreen";

export function AddTasks(props: { dense?: boolean }) {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

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
function getRandomBrightColor() {
  const getRandomValue = () => Math.floor(Math.random() * 128) + 128; // Values between 128 and 255

  const red = getRandomValue().toString(16).padStart(2, "0");
  const green = getRandomValue().toString(16).padStart(2, "0");
  const blue = getRandomValue().toString(16).padStart(2, "0");

  return `#${red}${green}${blue}`;
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
