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
  const [modalVisible, setModalVisible] = useState(false);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  return (
    <View>
      <AddTaskSheet bottomSheetModalRef={bottomSheetModalRef} />

      {props.dense && (
        <Pressable
          onPress={() => bottomSheetModalRef.current?.present()}
          className="flex flex-row justify-center items-center w-12 h-12 web:ring-offset-background web:transition-colors web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2"
        >
          {({ pressed }) => (
            <View className={cn("aspect-square ", pressed && "opacity-70")}>
              <Plus className="text-foreground" size={24} strokeWidth={3} />
            </View>
          )}
        </Pressable>
      )}
      {!props.dense && (
        <Button
          onPress={() => {
            bottomSheetModalRef.current?.present();
          }}
        >
          <Text>Add Task</Text>
        </Button>
      )}
    </View>
  );
}

function AddTaskSheet(props: {
  bottomSheetModalRef: React.RefObject<BottomSheetModalMethods>;
}) {
  const { colors } = useTheme();

  const { bottomSheetModalRef } = props;
  const [index, setIndex] = useState<number>(0);
  const realm = useRealm();
  const [isSimple, setIsSimple] = useState(false);
  // variables
  const snapPoints = useMemo<string[]>(() => {
    if (isSimple) {
      return ["40%"];
    } else {
      return ["90%"];
    }
  }, [isSimple]);

  return (
    <BottomSheetModal
      handleComponent={(props) => (
        <Handle
          {...props}
          title={!isSimple ? "Simple" : "Advanced"}
          onPress={() => setIsSimple(!isSimple)}
        />
      )}
      handleHeight={5}
      ref={bottomSheetModalRef}
      index={0}
      keyboardBehavior="interactive"
      snapPoints={snapPoints}
      handleIndicatorStyle={{
        backgroundColor: colors.border,
      }}
      backgroundStyle={{
        backgroundColor: colors.background,
      }}
      onAnimate={(_, index) => {
        console.log(index);
        if (index != -1) setIndex(index);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        // if (index == 0){
        //     setIsSimple(true);
        // }
      }}
    >
      <BottomSheetView>
        <EditTaskScreen
          submitLabel="Create"
          task={Task.generate("", "", "blue")}
          onSubmit={(task) => {
            realm.write(() => {
              realm.create("Task", task);
            });
            bottomSheetModalRef.current?.dismiss();
          }}
        />
      </BottomSheetView>
    </BottomSheetModal>
  );
}
