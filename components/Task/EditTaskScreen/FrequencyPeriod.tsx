import { EditableTask } from "~/models/Task";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { CALENDAR } from "~/models/schema";
import { Input } from "~/components/ui/input";
import * as React from "react";

export function FrequencyPeriod({
  ntask,
  setTask,
}: {
  ntask: EditableTask;
  setTask: (a: (a: EditableTask) => void) => void;
}) {
  return (
    <View className="bg-secondary p-3 rounded-xl">
      {ntask.repeats.period === "Daily" && (
        <View className="flex-col gap-3 items-start pl-3 pr-3">
          <Text className="font-semibold">Specific Days of the Week.</Text>
          <ToggleGroup
            value={
              ntask.repeats.specific_weekday?.map((a) => a.toString()) ?? []
            }
            onValueChange={(nDays) => {
              const parsedDays = nDays.map((a) => parseInt(a));
              setTask((a) => {
                a.repeats.specific_weekday = parsedDays;
                return a;
              });
            }}
            type="multiple"
          >
            {Array.from(CALENDAR, (a, i) => (
              <ToggleGroupItem key={i} value={i.toString()}>
                <Text className="w-[20px] text-center">{a}</Text>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <View className="flex-row gap-3 items-center">
            <Text className="">Repeats Every</Text>
            <Input
              defaultValue={ntask.repeats.every_n?.toString() ?? "1"}
              onChange={(a) => {
                setTask((b) => {
                  let c = parseInt(a.nativeEvent.text);
                  if (!Number.isNaN(c)) {
                    b.repeats.every_n = c;
                  }
                });
              }}
              className="w-12 text-center"
            />
            <Text className="">days</Text>
          </View>
        </View>
      )}
      {(ntask.repeats.period === "Weekly" ||
        ntask.repeats.period == "Monthly") && (
        <View className="flex flex-row items-center gap-2">
          <Text className="">Repeats Every</Text>
          <Input
            defaultValue={ntask.repeats.every_n?.toString() ?? "1"}
            onChange={(a) => {
              setTask((b) => {
                let c = parseInt(a.nativeEvent.text);
                if (!Number.isNaN(c)) {
                  b.repeats.every_n = c;
                }
              });
            }}
            className="w-12 text-center"
          />
          <Text>weeks</Text>
        </View>
      )}
    </View>
  );
}
