import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Pressable, ScrollView, View } from "react-native";
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
import { useTheme } from "@react-navigation/native";
import { EditableTask, Task } from "~/models/Task";
import { CALENDAR, UNITS } from "~/models/schema";
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

function SelectColor(props: {
  ntask: EditableTask;
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
                borderWidth: color == props.ntask.color ? 2 : 0,
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
            ></View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function Goal({
  ntask,
  setTask,
}: {
  ntask: EditableTask;
  setTask: (a: (a: EditableTask) => void) => void;
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
          <SelectTrigger className="w-32">
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
        <Label nativeID="steps">Steps of </Label>
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
  ntask: EditableTask;
  setTask: (a: (a: EditableTask) => void) => void;
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
  task: EditableTask;
  onSubmit: (task: EditableTask) => void;
}) {
  const { colors } = useTheme();
  const [ntask, setInnerTask] = useState(task);

  const setTask = useCallback((write: (a: EditableTask) => void) => {
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
    <View className="h-full pb-10">
      <ScrollView className="flex-grow">
        <View>
          <Tabs
            value={value}
            onValueChange={setValue}
            className="mx-2  flex-col gap-4"
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

            <View className={"flex-grow flex flex-col gap-3 p-2"}>
              <TaskCard
                task={ntask as Task}
                completed={{
                  completed: [],
                  isCompleted: false,
                  total: 0,
                }}
                completable={true}
                streak={0}
                onCompletePress={() => {}}
                onCompleteLongPress={() => {}}
              />
              <TabsContent value="basic" className="flex flex-col gap-3">
                <Text className="text-l font-semibold text-muted-foreground">
                  INFO
                </Text>

                <View className="bg-secondary p-3 rounded-xl">
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
                </View>
                <Text className="text-l font-semibold text-muted-foreground">
                  COLOR
                </Text>
                <SelectColor
                  ntask={ntask}
                  onChange={(colors) => {
                    setTask((a) => {
                      a.color = colors.hex;
                    });
                  }}
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
                <Text className="text-l font-semibold text-muted-foreground">
                  STARTING DAY
                </Text>
                <View className="bg-secondary p-3 rounded-xl">
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Text className="">
                        {formatDate(ntask.startsOn, "MMMM, dd, yyyy")}
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
                </View>
              </TabsContent>
              <TabsContent value="goal" className="flex flex-col gap-2 ">
                <Text className="text-l font-semibold text-muted-foreground">
                  GOAL
                </Text>
                <View className="bg-secondary p-3 rounded-xl">
                  <Goal ntask={ntask} setTask={setTask} />
                </View>
              </TabsContent>
            </View>
          </Tabs>
        </View>
      </ScrollView>
      <View className={"mt-auto flex-col p-5 gap-3"}>
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
