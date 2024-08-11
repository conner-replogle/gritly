import { EditableHabit } from "~/models/Habit";
import { UNITS } from "~/models/schema";
import { View } from "react-native";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import * as React from "react";
import { PortalHost } from "~/components/primitives/portal";

export function Goal({
  habit,
  setHabit,
}: {
  habit: EditableHabit;
  setHabit: (a: (a: EditableHabit) => void) => void;
}) {
  let value =
    UNITS.find((a) => a.value == habit.goal.unit)?.name ?? habit.goal.unit!;
  return (
    <View className="flex flex-row gap-3 justify-evenly">
      <View className="flex flex-col gap-2">
        <Label nativeID="Amount">Amount</Label>
        <Input
          defaultValue={habit.goal.amount.toString()}
          className="w-[80px]"
          placeholder="Amount"
          keyboardType="numeric"
          onChange={(a) => {
            let n = parseInt(a.nativeEvent.text);
            if (!Number.isNaN(n)) {
              setHabit((b) => {
                b.goal.amount = n;
              });
            }
          }}
        />
      </View>
      <View className="flex flex-col gap-2">
        <Label nativeID="Units">Units</Label>
        <Select
          nativeID="Units"
          defaultValue={{
            value: habit.goal.unit,
            label: value,
          }}
          value={{
            value: habit.goal!.unit,
            label: value,
          }}
          onValueChange={(b) =>
            setHabit((a) => {
              a.goal.unit = b?.value ?? "count";
            })
          }
        >
          <SelectTrigger className="w-32">
            <SelectValue
              className="text-foreground text-sm native:text-lg"
              placeholder="Select a unit"
            />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {Array.from(UNITS, (a) => {
                return (
                  <SelectItem key={a.name} label={a.name} value={a.value}>
                    {a.name}
                  </SelectItem>
                );
              })}
            </SelectGroup>
          </SelectContent>
        </Select>

        {habit.goal?.unit == "custom" && (
          <Input
            placeholder="Custom Unit"
            onChange={(a) => {
              setHabit((b) => {
                b.goal.customName = a.nativeEvent.text;
              });
            }}
          />
        )}
      </View>
      <View className="flex flex-col gap-2">
        <Label nativeID="steps">Steps of </Label>
        <Input
          defaultValue={habit.goal.steps.toString()}
          className="w-24"
          nativeID="steps"
          placeholder="Steps"
          keyboardType="numeric"
          onChange={(a) => {
            let n = parseInt(a.nativeEvent.text);
            if (!Number.isNaN(n)) {
              setHabit((b) => {
                b.goal.steps = n;
              });
            }
          }}
        />
      </View>
    </View>
  );
}
