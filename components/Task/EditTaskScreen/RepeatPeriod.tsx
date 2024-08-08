import { EditableTask, Frequency, Period } from "~/models/Task";
import { View } from "react-native";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import * as React from "react";
import { Label } from "~/components/ui/label";

export function RepeatPeriod(props: {
  ntask: EditableTask;
  setTask: (a: (a: EditableTask) => void) => void;
}) {
  const onValueChange = (label: string) => {
    props.setTask((a) => {
      a.repeats.period = label as Period;
      a.repeats.selected_frequency = Frequency.every_n;
    });
  };

  return (
    <View className="bg-secondary p-3 rounded-xl">
      <RadioGroup
        value={props.ntask.repeats.period}
        onValueChange={onValueChange}
        className="gap-3"
      >
        <RadioGroupItemWithLabel
          onLabelPress={onValueChange}
          value={Period.Daily}
        />
        <RadioGroupItemWithLabel
          onLabelPress={onValueChange}
          value={Period.Weekly}
        />
        <RadioGroupItemWithLabel
          onLabelPress={onValueChange}
          value={Period.Monthly}
        />
      </RadioGroup>
    </View>
  );
}

function RadioGroupItemWithLabel({
  value,
  onLabelPress,
}: {
  value: string;
  onLabelPress: (label: string) => void;
}) {
  return (
    <View className={"flex-row gap-2 items-center"}>
      <RadioGroupItem aria-labelledby={`label-for-${value}`} value={value} />
      <Label
        nativeID={`label-for-${value}`}
        onPress={() => onLabelPress(value)}
      >
        {value}
      </Label>
    </View>
  );
}
