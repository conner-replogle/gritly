import { EditableHabit } from "~/models/Habit";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { CALENDAR } from "~/models/schema";
import { Input } from "~/components/ui/input";
import * as React from "react";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Frequency, Period } from "~/lib/types";

export function FrequencyPeriod({
  habit,
  setHabit,
}: {
  habit: EditableHabit;
  setHabit: (a: (a: EditableHabit) => void) => void;
}) {
  return (
    <View className="bg-secondary p-3 rounded-xl">
      <RadioGroup
        value={habit.repeats.selected_frequency}
        onValueChange={(value) => {
          setHabit((a) => {
            a.repeats.selected_frequency = value as Frequency;
          });
        }}
      >
        {habit.repeats.period === Period.Daily && (
          <View className="flex-row  items-center">
            <RadioGroupItem
              aria-labelledby={Frequency.specific_weekday}
              value={Frequency.specific_weekday}
            />

            <SpecificWeekDays habit={habit} setHabit={setHabit} />
          </View>
        )}
        <View className="flex-row items-center gap-3">
          <RadioGroupItem
            aria-labelledby={Frequency.every_n}
            value={Frequency.every_n}
          />
          <View className="flex flex-row items-center gap-2">
            <Text className="">Repeats Every</Text>
            <Input
              defaultValue={habit.repeats.every_n?.toString() ?? "1"}
              onChange={(a) => {
                setHabit((b) => {
                  let c = parseInt(a.nativeEvent.text);
                  if (!Number.isNaN(c)) {
                    b.repeats.every_n = c;
                  }
                });
              }}
              className="w-12 text-center"
            />
            <Text>{habit.repeats.period}</Text>
          </View>
        </View>
      </RadioGroup>
    </View>
  );
}

function SpecificWeekDays({
  habit,
  setHabit,
}: {
  habit: EditableHabit;
  setHabit: (a: (a: EditableHabit) => void) => void;
}) {
  return (
    <View className="flex-col gap-3 items-start pl-3 pr-3">
      <ToggleGroup
        value={habit.repeats.specific_weekday?.map((a) => a.toString()) ?? []}
        onValueChange={(nDays) => {
          const parsedDays = nDays.map((a) => parseInt(a));
          setHabit((a) => {
            a.repeats.specific_weekday = parsedDays;
            return a;
          });
        }}
        type="multiple"
      >
        {Array.from(CALENDAR, (a, i) => (
          <ToggleGroupItem
            className="aspect-square"
            key={i}
            value={i.toString()}
          >
            <Text className="w-[20px] text-center">{a}</Text>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </View>
  );
}
