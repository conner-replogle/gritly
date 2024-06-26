import { CALENDAR, Task, UNITS } from "~/lib/states/task";
import { Dispatch, SetStateAction, useState } from "react";
import { ScrollView, View } from "react-native";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import ColorPicker, {
  HueSlider,
  Panel1,
  Preview,
  returnedResults,
} from "reanimated-color-picker";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { TaskCard } from "~/components/Task/taskCard";
import { formatDate } from "date-fns";
import DateTimePicker from "react-native-ui-datepicker/src/DateTimePicker";

function SelectColor(props: {
  ntask: Task;
  onChange: (colors: returnedResults) => void;
}) {
  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <Text className="text-xl font-semibold">Select Color </Text>
      </CollapsibleTrigger>
      <CollapsibleContent className="p-5">
        <ColorPicker
          style={{ width: "100%" }}
          value={props.ntask.color}
          onChange={props.onChange}
        >
          <Preview />
          <Panel1 />
          <HueSlider />
        </ColorPicker>
      </CollapsibleContent>
    </Collapsible>
  );
}

function Goal({
  ntask,
  setTask,
}: {
  ntask: Task;
  setTask: Dispatch<SetStateAction<Task>>;
}) {
  let value =
    UNITS.find((a) => a.value == ntask.goal.unit)?.name ?? ntask.goal.unit!;
  return (
    <View className="flex flex-row gap-3 justify-evenly">
      <View className="flex flex-col gap-2">
        <Label nativeID="Units">Amount</Label>
        <Input
          defaultValue={ntask.goal.amount.toString()}
          className="w-[80px]"
          placeholder="Amount"
          keyboardType="numeric"
          onChange={(b) => {
            setTask(
              (a) =>
                ({
                  ...a,
                  goal: {
                    ...a.goal,
                    amount: parseInt(b.nativeEvent.text),
                  },
                } as Task)
            );
          }}
        />
      </View>
      <View className="flex flex-col gap-2">
        <Label nativeID="Units">Units</Label>
        <Select
          nativeID="Units"
          defaultValue={{
            value: ntask.goal.unit,
            label: value,
          }}
          value={{
            value: ntask.goal!.unit,
            label: value,
          }}
          onValueChange={(b) =>
            setTask(
              (a) =>
                ({
                  ...a,
                  goal: {
                    ...a.goal,
                    unit: b?.value ?? "count",
                  },
                } as Task)
            )
          }
        >
          <SelectTrigger className="w-24">
            <SelectValue
              className="text-foreground text-sm native:text-lg"
              placeholder="Select a unit"
            />
          </SelectTrigger>
          <SelectContent className="w-24">
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

        {ntask.goal?.unit == "custom" && (
          <Input
            placeholder="Custom Unit"
            onChange={(a) => {
              setTask(
                (b) =>
                  ({
                    ...b,
                    goal: {
                      ...b.goal,
                      customName: a.nativeEvent.text,
                    },
                  } as Task)
              );
            }}
          />
        )}
      </View>
      <View className="flex flex-col gap-2">
        <Label nativeID="steps">Steps</Label>
        <Input
          defaultValue={ntask.goal.steps.toString()}
          className="w-24"
          nativeID="steps"
          placeholder="Steps"
          keyboardType="numeric"
          onChange={(a) => {
            let n = parseInt(a.nativeEvent.text);
            if (!Number.isNaN(n)) {
              setTask(
                (b) =>
                  ({
                    ...b,
                    goal: {
                      ...b.goal,
                      steps: n,
                    },
                  } as Task)
              );
            }
          }}
        />
      </View>
    </View>
  );
}

function RepeatPeriod(props: {
  ntask: Task;
  onValueChange: (a: any) => void;
  onLabelPress: () => void;
  onLabelPress1: () => void;
}) {
  return (
    <RadioGroup
      value={props.ntask.repeats.period}
      onValueChange={props.onValueChange}
      className="gap-3"
    >
      <RadioGroupItemWithLabel
        onLabelPress={props.onLabelPress}
        value="Daily"
      />
      <RadioGroupItemWithLabel
        onLabelPress={props.onLabelPress1}
        value="Weekly"
      />
    </RadioGroup>
  );
}

export function EditTaskScreen({
  onDelete,
  submitLabel,
  task,
  onSubmit,
}: {
  onDelete?: () => void;
  submitLabel: string;
  task: Task;
  onSubmit: (task: Task) => void;
}) {
  const [ntask, setTask] = useState(task);
  function ValidateForm() {
    return ntask.title.length > 0;
  }
  function onLabelPress(label: string) {
    setTask((a) => {
      return {
        ...a,
        repeats: {
          ...a.repeats,
          period: label,
        },
      } as Task;
    });
  }
  function onDayPress(nDays: string[]) {
    console.log(nDays);
    const parsedDays = nDays.map((a) => parseInt(a));
    console.log(parsedDays);
    setTask((a) => {
      return {
        ...a,
        repeats: {
          ...a.repeats,
          specific_weekday: parsedDays,
        },
      } as Task;
    });
  }
  return (
    <ScrollView contentInset={{ bottom: 300 }}>
      <View className="bg-background   p-5 pt-0 flex flex-col gap-4">
        <Label nativeID="title">Title</Label>
        <Input
          placeholder="Name your task"
          nativeID="title"
          value={ntask.title}
          onChangeText={(b) => {
            setTask((a) => {
              return {
                ...a,
                title: b,
              } as Task;
            });
          }}
          aria-labelledbyledBy="inputLabel"
          aria-errormessage="inputError"
        />
        <Label nativeID="description">Description</Label>
        <Input
          placeholder="What exactly is this task?"
          nativeID="description"
          value={ntask.description}
          onChangeText={(b) => {
            setTask((a) => {
              return {
                ...a,
                description: b,
              } as Task;
            });
          }}
          aria-labelledbyledBy="inputLabel"
          aria-errormessage="inputError"
        />
        <Text className="text-xl font-semibold">Type</Text>
        <RepeatPeriod
          ntask={ntask}
          onValueChange={(a) => {
            onLabelPress(a);
          }}
          onLabelPress={() => onLabelPress("Daily")}
          onLabelPress1={() => onLabelPress("Weekly")}
        />
        {ntask.repeats.period === "Daily" && (
          <ToggleGroup
            value={
              ntask.repeats.specific_weekday?.map((a) => a.toString()) ?? []
            }
            onValueChange={onDayPress}
            type="multiple"
          >
            {Array.from(CALENDAR, (a, i) => (
              <ToggleGroupItem key={i} value={i.toString()}>
                <Text className="w-[20px] text-center">{a}</Text>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        )}

        <Collapsible>
          <CollapsibleTrigger asChild>
            <Text className="text-xl font-semibold">
              Starting Day - {formatDate(ntask.startsOn, "MMMM, dd, yyyy")}
            </Text>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <DateTimePicker
              mode="single"
              date={ntask.startsOn}
              onChange={({ date }) => {
                setTask((a) => {
                  return {
                    ...a,
                    startsOn: new Date(date as string),
                  } as Task;
                });
              }}
            />
          </CollapsibleContent>
        </Collapsible>

        <SelectColor
          ntask={ntask}
          onChange={(colors) => {
            setTask(
              (a) =>
                ({
                  ...a,
                  color: colors.hex,
                } as Task)
            );
          }}
        />

        <Text className="text-xl font-semibold">Goal</Text>
        <Goal ntask={ntask} setTask={setTask} />

        <Collapsible defaultOpen>
          <CollapsibleTrigger asChild>
            <Text className="text-xl font-semibold">Preview</Text>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <TaskCard
              task={ntask}
              completed={undefined}
              completable={true}
              streak={0}
              onCardPress={() => {}}
              onCompletePress={() => {}}
              onCompleteLongPress={() => {}}
            />
          </CollapsibleContent>
        </Collapsible>

        <Button
          onPress={() => {
            if (!ValidateForm()) {
              return;
            }
            onSubmit(ntask);
          }}
        >
          <Text>{submitLabel}</Text>
        </Button>
        {onDelete && (
          <Button variant={"destructive"} onPress={onDelete}>
            <Text>Delete</Text>
          </Button>
        )}
      </View>
    </ScrollView>
  );
}

function RadioGroupItemWithLabel({
  value,
  onLabelPress,
}: {
  value: string;
  onLabelPress: () => void;
}) {
  return (
    <View className={"flex-row gap-2 items-center"}>
      <RadioGroupItem aria-labelledby={`label-for-${value}`} value={value} />
      <Label nativeID={`label-for-${value}`} onPress={onLabelPress}>
        {value}
      </Label>
    </View>
  );
}
