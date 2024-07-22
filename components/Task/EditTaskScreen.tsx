import { CALENDAR, Completed, Repeat, Task, UNITS } from "~/lib/states/task";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
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
  Swatches,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Unmanaged } from "realm";
import { useRealm } from "@realm/react";
import { useTheme } from "@react-navigation/native";

function SelectColor(props: {
  ntask: Task;
  onChange: (colors: returnedResults) => void;
}) {
  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <Text className=" font-semibold">Select Color </Text>
      </CollapsibleTrigger>
      <CollapsibleContent className="p-5">
        <ColorPicker
          style={{ width: "100%" }}
          value={props.ntask.color}
          onChange={props.onChange}
        >
          <Swatches />
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
  setTask: (a: (a: Task) => void) => void;
}) {
  let value =
    UNITS.find((a) => a.value == ntask.goal.unit)?.name ?? ntask.goal.unit!;
  return (
    <View className="flex flex-row gap-3 justify-evenly">
      <View className="flex flex-col gap-2">
        <Label nativeID="Amount">Amount</Label>
        <Input
          defaultValue={ntask.goal.amount.toString()}
          className="w-[80px]"
          placeholder="Amount"
          keyboardType="numeric"
          onChange={(a) => {
            let n = parseInt(a.nativeEvent.text);
            if (!Number.isNaN(n)) {
              setTask((b) => {
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
            value: ntask.goal.unit,
            label: value,
          }}
          value={{
            value: ntask.goal!.unit,
            label: value,
          }}
          onValueChange={(b) =>
            setTask((a) => {
              a.goal.unit = b?.value ?? "count";
            })
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
              setTask((b) => {
                b.goal.customName = a.nativeEvent.text;
              });
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
              setTask((b) => {
                b.goal.steps = n;
              });
            }
          }}
        />
      </View>
    </View>
  );
}

function RepeatPeriod(props: {
  ntask: Task;
  setTask: (a: (a: Task) => void) => void;
}) {
  const onValueChange = (label: string) => {
    props.setTask((a) => {
      a.repeats.period = label;
    });
  };

  return (
    <View className="bg-secondary p-3 rounded-xl">
      <RadioGroup
        value={props.ntask.repeats.period}
        onValueChange={onValueChange}
        className="gap-3"
      >
        <RadioGroupItemWithLabel onLabelPress={onValueChange} value="Daily" />
        <RadioGroupItemWithLabel onLabelPress={onValueChange} value="Weekly" />
        <RadioGroupItemWithLabel onLabelPress={onValueChange} value="Monthly" />
      </RadioGroup>
    </View>
  );
}

function FrequencyPeriod({
  ntask,
  setTask,
}: {
  ntask: Task;
  setTask: (a: (a: Task) => void) => void;
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
              console.log(nDays);
              const parsedDays = nDays.map((a) => parseInt(a));
              console.log(parsedDays);
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
            <Text className="font-semibold">Repeats Every</Text>
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
            <Text className="font-semibold text-xl ">days</Text>
          </View>
        </View>
      )}
      {(ntask.repeats.period === "Weekly" ||
        ntask.repeats.period == "Monthly") && (
        <View className="flex flex-row items-center gap-2">
          <Text className="font-semibold text-xl">Repeats Every</Text>
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
          <Text className="font-semibold text-xl ">weeks</Text>
        </View>
      )}
    </View>
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
  useEffect(() => {
    realm.beginTransaction();
    return () => {
      if (realm.isInTransaction) {
        realm.cancelTransaction();
      }
    };
  }, []);
  const { colors } = useTheme();
  const realm = useRealm();
  const [ntask, setInnerTask] = useState(task);
  console.log("Here");
  console.log(ntask);
  const setTask = useCallback((write: (a: Task) => void) => {
    write(ntask);
    setInnerTask({
      ...ntask,
    } as Task);
  }, []);

  function ValidateForm() {
    return ntask.title.length > 0;
  }
  const tabs = ["basic", "repeats", "goal"];
  const [value, setValue] = useState("basic");
  return (
    <ScrollView>
      <Tabs
        value={value}
        onValueChange={setValue}
        className=" mx-2  flex-col gap-4"
      >
        <TabsList className="flex-row ">
          <TabsTrigger value="basic" className="flex-1">
            <Text>Basic</Text>
          </TabsTrigger>
          <TabsTrigger value="repeats" className="flex-1">
            <Text>Repeats</Text>
          </TabsTrigger>
          <TabsTrigger value="goal" className="flex-1">
            <Text>Goal</Text>
          </TabsTrigger>
        </TabsList>
        <View className={"flex flex-col gap-3 p-2"}>
          <TabsContent value="basic" className="flex flex-col gap-3">
            <Label nativeID="title">Title</Label>
            <Input
              placeholder="Name your task"
              nativeID="title"
              value={ntask.title}
              onChangeText={(b) => {
                setTask((a) => {
                  a.title = b;
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
                  a.description = b;
                });
              }}
              aria-labelledbyledBy="inputLabel"
              aria-errormessage="inputError"
            />
          </TabsContent>
          <TabsContent value="repeats" className="flex flex-col gap-2 ">
            <Text className="text-l font-semibold text-muted-foreground">
              REPEATS
            </Text>
            <RepeatPeriod ntask={ntask} setTask={setTask} />

            <Text className="text-l font-semibold text-muted-foreground">
              FREQUENCY
            </Text>
            <FrequencyPeriod ntask={ntask} setTask={setTask} />

            <Collapsible>
              <CollapsibleTrigger asChild>
                <Text className="">
                  Starting Day - {formatDate(ntask.startsOn, "MMMM, dd, yyyy")}
                </Text>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <DateTimePicker
                  mode="single"
                  todayTextStyle={{ color: colors.text }}
                  calendarTextStyle={{ color: colors.text }}
                  headerTextStyle={{ color: colors.text }}
                  weekDaysTextStyle={{ color: colors.text }}
                  date={ntask.startsOn}
                  onChange={({ date }) => {
                    setTask((a) => {
                      a.startsOn = new Date(date as string);
                    });
                  }}
                />
              </CollapsibleContent>
            </Collapsible>
          </TabsContent>
          <TabsContent value="goal" className="flex flex-col gap-2 ">
            <Goal ntask={ntask} setTask={setTask} />
          </TabsContent>
          <SelectColor
            ntask={ntask}
            onChange={(colors) => {
              setTask((a) => {
                a.color = colors.hex;
              });
            }}
          />

          <TaskCard
            task={ntask}
            completed={undefined}
            completable={true}
            streak={0}
            onCardPress={() => {}}
            onCompletePress={() => {}}
            onCompleteLongPress={() => {}}
          />

          <Button
            onPress={() => {
              if (value != "goal") {
                setValue(tabs[tabs.indexOf(value) + 1] ?? "basic");
                return;
              }
              if (!ValidateForm()) {
                return;
              }
              onSubmit(ntask);
            }}
          >
            <Text>{value == "goal" ? submitLabel : "Next"}</Text>
          </Button>
          {onDelete && (
            <Button variant={"destructive"} onPress={onDelete}>
              <Text>Delete</Text>
            </Button>
          )}
        </View>
      </Tabs>
    </ScrollView>
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
