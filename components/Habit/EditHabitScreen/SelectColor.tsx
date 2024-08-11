import { EditableHabit } from "~/models/Habit";
import { returnedResults } from "reanimated-color-picker";
import { useTheme } from "@react-navigation/native";
import { Pressable, View } from "react-native";
import * as React from "react";

export const SWATCHES_COLORS = [
  "#f44336",
  "#E91E63",
  "#9C27B0",
  "#673AB7",
  "#3F51B5",
  "#2196F3",
  "#03A9F4",
  "#00BCD4",
  "#009688",
  "#4CAF50",
  "#8BC34A",
  "#CDDC39",
  "#FFEB3B",
  "#FFC107",
  "#FF9800",
  "#FF5722",
];

export function SelectColor(props: {
  habit: EditableHabit;
  onChange: (colors: returnedResults) => void;
}) {
  const theme = useTheme();
  return (
    <View className="bg-secondary p-3 rounded-xl">
      <View className="flex-row flex-wrap justify-between ">
        {SWATCHES_COLORS.map((color, index) => (
          <Pressable
            key={index}
            onPress={() => {
              props.onChange({
                hex: color,
                hsl: color,
                hsv: color,
                rgb: color,
              } as returnedResults);
            }}
          >
            <View
              key={index}
              style={{
                backgroundColor: color,
                margin: 5,
                borderWidth: color == props.habit.color ? 2 : 0,
                borderColor: theme.colors.primary,
                width: 30,
                height: 30,
                borderRadius: 15,
                marginHorizontal: 5,
                marginBottom: 15,
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }}
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
}
