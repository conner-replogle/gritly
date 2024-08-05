import { EditableTask, Task } from "~/models/Task";
import { useTheme } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { ScrollView, View } from "react-native";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Text } from "~/components/ui/text";
import { TaskCard } from "~/components/Task/taskCard";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { formatDate } from "date-fns";
import DateTimePicker from "react-native-ui-datepicker/src/DateTimePicker";
import { Button } from "~/components/ui/button";
import * as React from "react";
import { SelectColor } from "~/components/Task/EditTaskScreen/SelectColor";
import { RepeatPeriod } from "~/components/Task/EditTaskScreen/RepeatPeriod";
import { Goal } from "~/components/Task/EditTaskScreen/Goal";
import { FrequencyPeriod } from "~/components/Task/EditTaskScreen/FrequencyPeriod";
import { PortalHost } from "~/components/primitives/portal";
import { SelectIcon } from "~/components/Task/EditTaskScreen/SelectIcon";
import { withObservables } from "@nozbe/watermelondb/react";

function Basic({
  ntask,
  setTask,
}: {
  ntask: EditableTask;
  setTask: (a: (a: EditableTask) => void) => void;
}) {
  const colors = useTheme().colors;

  return (
    <>
      <Text className="text-l font-semibold text-muted-foreground">INFO</Text>

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

        <Label nativeID="select-icon">Select Icon</Label>
        <SelectIcon />
      </View>

      <Text className="text-l font-semibold text-muted-foreground">COLOR</Text>
      <SelectColor
        ntask={ntask}
        onChange={(colors) => {
          setTask((a) => {
            a.color = colors.hex;
          });
        }}
      />
    </>
  );
}

function Repeats({
  ntask,
  setTask,
}: {
  ntask: EditableTask;
  setTask: (a: (a: EditableTask) => void) => void;
}) {
  const colors = useTheme().colors;
  return (
    <>
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
    </>
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
                completed={undefined}
                completable={true}
                streak={0}
                onCompletePress={() => {}}
                onCompleteLongPress={() => {}}
              />
              <TabsContent value="basic" className="flex flex-col gap-3">
                <Basic ntask={ntask} setTask={setTask} />
              </TabsContent>
              <TabsContent value="repeats" className="flex flex-col gap-2 ">
                <Repeats ntask={ntask} setTask={setTask} />
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
