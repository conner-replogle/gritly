import { EditableHabit, Habit } from "~/models/Habit";
import { useTheme } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Text } from "~/components/ui/text";
import { HabitCard } from "~/components/Habit/habitCard";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { fuzzySearch } from "~/components/IconPicker/IconSelector";

import {
  addWeeks,
  endOfDay,
  endOfWeek,
  formatDate,
  startOfDay,
  startOfWeek,
} from "date-fns";
import DateTimePicker from "react-native-ui-datepicker/src/DateTimePicker";
import { Button } from "~/components/ui/button";
import * as React from "react";
import { SelectColor } from "~/components/Habit/EditHabitScreen/SelectColor";
import { RepeatPeriod } from "~/components/Habit/EditHabitScreen/RepeatPeriod";
import { Goal } from "~/components/Habit/EditHabitScreen/Goal";
import { FrequencyPeriod } from "~/components/Habit/EditHabitScreen/FrequencyPeriod";
import { PortalHost } from "~/components/primitives/portal";
import { withObservables } from "@nozbe/watermelondb/react";
import { getNextDate } from "~/lib/utils";
import IconSelector from "~/components/IconPicker/IconSelector";

function Basic({
  habit,
  setHabit,
}: {
  habit: EditableHabit;
  setHabit: (a: (a: EditableHabit) => void) => void;
}) {
  const colors = useTheme().colors;

  return (
    <>
      <Text className="text-l font-semibold text-muted-foreground">INFO</Text>

      <View className="bg-secondary p-3 rounded-xl">
        <Label nativeID="title">Title</Label>
        <Input
          placeholder="Name your habit"
          nativeID="title"
          value={habit.title}
          onChangeText={(b) => {
            setHabit((a) => {
              a.title = b;
            });
          }}
          selectTextOnFocus
          onEndEditing={(b) => {
            if (habit.icon == undefined) {
              let suggested_icon = fuzzySearch(b.nativeEvent.text).at(0)?.item;
              if (suggested_icon != undefined) {
                setHabit((a) => {
                  a.icon = suggested_icon!;
                });
              }
            }
          }}
          aria-labelledbyledBy="inputLabel"
          aria-errormessage="inputError"
        />
        <Label nativeID="description">Description</Label>
        <Input
          placeholder="What exactly is this habit? (Optional)"
          nativeID="description"
          value={habit.description}
          onChangeText={(b) => {
            setHabit((a) => {
              a.description = b;
            });
          }}
          aria-labelledbyledBy="inputLabel"
          aria-errormessage="inputError"
        />

        <Label nativeID="select-icon">Select Icon</Label>
        <IconSelector
          icon={habit.icon}
          setIcon={(icon) => {
            setHabit((a) => {
              a.icon = icon;
            });
          }}
        />
      </View>

      <Text className="text-l font-semibold text-muted-foreground">COLOR</Text>
      <SelectColor
        habit={habit}
        onChange={(colors) => {
          setHabit((a) => {
            a.color = colors.hex;
          });
        }}
      />
    </>
  );
}

function Repeats({
  habit,
  setHabit,
}: {
  habit: EditableHabit;
  setHabit: (a: (a: EditableHabit) => void) => void;
}) {
  const colors = useTheme().colors;
  const next_n_dates = useMemo(() => {
    let start = startOfDay(new Date(Date.now()));
    let end_day = startOfDay(
      addWeeks(startOfWeek(start, { weekStartsOn: 6 }), 3)
    );
    console.log(end_day);
    let dates: Date[] = [getNextDate(habit.repeats, start)];
    while (true) {
      let next_date = getNextDate(
        habit.repeats,
        startOfDay(dates.at(-1) ?? habit.startsOn)
      );
      if (next_date <= end_day) {
        dates.push(next_date);
      } else {
        break;
      }
    }
    return dates;
  }, [habit]);
  return (
    <>
      <Text className="text-l font-semibold text-muted-foreground">
        REPEATS
      </Text>
      <RepeatPeriod habit={habit} setHabit={setHabit} />

      <Text className="text-l font-semibold text-muted-foreground">
        FREQUENCY
      </Text>
      <FrequencyPeriod habit={habit} setHabit={setHabit} />
      <Text className="text-l font-semibold text-muted-foreground">
        STARTING DAY
      </Text>
      <View className="bg-secondary p-3 rounded-xl">
        <DateTimePicker
          mode="single"
          todayTextStyle={{ color: colors.text }}
          calendarTextStyle={{ color: colors.text }}
          headerTextStyle={{ color: colors.text }}
          headerContainerStyle={{
            backgroundColor: colors.border,
            borderRadius: 15,
          }}
          highlightedDays={next_n_dates}
          headerButtonsPosition={"right"}
          weekDaysTextStyle={{ color: colors.text }}
          highlightedContainerStyle={{
            backgroundColor: colors.border,
          }}
          date={habit.startsOn}
          onChange={({ date }) => {
            setHabit((a) => {
              a.startsOn = new Date(date as string);
            });
          }}
        />
      </View>
    </>
  );
}

export function EditHabitScreen({
  onDelete,
  submitLabel,
  nhabit,
  onSubmit,
}: {
  onDelete?: () => void;
  submitLabel: string;
  nhabit: EditableHabit;
  onSubmit: (habit: EditableHabit) => void;
}) {
  const { colors } = useTheme();
  const [habit, setInnerHabit] = useState(nhabit);

  const setHabit = useCallback((write: (a: EditableHabit) => void) => {
    write(habit);

    setInnerHabit({
      ...habit,
    } as Habit);
  }, []);

  function ValidateForm() {
    return habit.title.length > 0;
  }

  const tabs = ["info", "repeats", "goal"];
  const [value, setValue] = useState("info");
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
              <TabsTrigger value="info" className="flex-1">
                <Text>Info</Text>
              </TabsTrigger>
              <TabsTrigger value="repeats" className="flex-1">
                <Text>Repeats</Text>
              </TabsTrigger>
              <TabsTrigger value="goal" className="flex-1">
                <Text>Goal</Text>
              </TabsTrigger>
            </TabsList>

            <View className={"flex-grow flex flex-col gap-3 p-2"}>
              <HabitCard
                habit={habit as Habit}
                completed={undefined}
                completable={true}
                streak={0}
                onCompletePress={() => {}}
                onCompleteLongPress={() => {}}
              />
              <TabsContent value="info" className="flex flex-col gap-3">
                <Basic habit={habit} setHabit={setHabit} />
              </TabsContent>
              <TabsContent value="repeats" className="flex flex-col gap-2 ">
                <Repeats habit={habit} setHabit={setHabit} />
              </TabsContent>
              <TabsContent value="goal" className="flex flex-col gap-2 ">
                <Text className="text-l font-semibold text-muted-foreground">
                  GOAL
                </Text>
                <View className="bg-secondary p-3 rounded-xl">
                  <Goal habit={habit} setHabit={setHabit} />
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
            onSubmit(habit);
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
