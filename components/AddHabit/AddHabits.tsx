import { LayoutAnimation, Pressable, View } from "react-native";

import { Text } from "../ui/text";

import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { Button } from "../ui/button";

import { useContext, useMemo, useRef, useState } from "react";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { useTheme } from "@react-navigation/native";

import { EditHabitScreen } from "~/components/Habit/EditHabitScreen";
import { log, SubscriptionContext } from "~/lib/config";
import { EditableHabit, Habit } from "~/models/Habit";
import { useDatabase } from "@nozbe/watermelondb/hooks";
import { TableName } from "~/models/schema";
import { PlusCircleIcon } from "lucide-react-native";
import { GenerateHabit } from "~/lib/utils";

export function AddHabits(props: { dense?: boolean }) {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const subscription = useContext(SubscriptionContext);
  return (
    <View>
      <AddHabitSheet bottomSheetModalRef={bottomSheetModalRef} />

      <Button
        onPress={() => {
          bottomSheetModalRef.current?.present();
        }}
      >
        <Text>Add Habit</Text>
      </Button>
    </View>
  );
}

export function AddHabitsIcon(props: {
  color: string;
  fill: string;
  size: number;
}) {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  return (
    <View>
      <AddHabitSheet bottomSheetModalRef={bottomSheetModalRef} />

      <Pressable
        onPress={() => {
          bottomSheetModalRef.current?.present();
        }}
      >
        <PlusCircleIcon {...props} />
      </Pressable>
    </View>
  );
}

function AddHabitSheet({
  bottomSheetModalRef,
}: {
  bottomSheetModalRef: React.RefObject<BottomSheetModalMethods>;
}) {
  const database = useDatabase();

  const { colors } = useTheme();
  const [newHabit, setNewHabit] = useState<EditableHabit>(GenerateHabit());

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
        <EditHabitScreen
          submitLabel="Create"
          nhabit={newHabit}
          onSubmit={async (habit) => {
            bottomSheetModalRef.current?.dismiss();
            bottomSheetModalRef.current?.forceClose();
            await database.write(async () => {
              await database.get<Habit>(TableName.HABITS).create((newHabit) => {
                newHabit.title = habit.title;
                newHabit.goal = habit.goal;
                newHabit.icon = habit.icon;

                newHabit.color = habit.color;
                newHabit.repeats = habit.repeats;
                newHabit.startsOn = habit.startsOn;
                newHabit.description = habit.description;
              });
            });
            log.debug(`Created Habit ${habit.title}`);

            setNewHabit(GenerateHabit());
          }}
        />
      </BottomSheetView>
    </BottomSheetModal>
  );
}
