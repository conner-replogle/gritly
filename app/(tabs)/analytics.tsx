import { Text } from "~/components/ui/text";
import { SettingsSheet } from "~/components/Settings/Settings";
import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "react-native";
import { Calendar } from "react-native-calendars";
import { useTheme } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import useTasks from "~/lib/hooks/Tasks";
import { Task } from "~/models/Task";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { WeeklyContent, WeeklyHeader } from "~/components/Analytics/Weekly";
import * as React from "react";
import { AnalyticsScreen } from "~/components/Analytics/AnalyticsScreen";

enum AnalyticsType {
  weekly = "weekly",
  monthly = "monthly",
  all_time = "all_time",
}

export default function Analytics() {
  const { colors } = useTheme();
  const tasks = useTasks();
  const { task_id } = useLocalSearchParams<{ task_id?: string }>();
  const [task, setTask] = useState<Task | undefined>(undefined);

  useEffect(() => {
    if (task_id) {
      let target_task = tasks.find((a) => a.id === task_id);
      setTask(target_task);
    }
  }, [task_id]);

  return (
    <SafeAreaView>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 15,
        }}
      >
        <Text className="font-bold text-3xl">Analytics</Text>
        <SelectTask
          tasks={tasks}
          selected={
            task
              ? { value: task?.id, label: task?.title }
              : { value: "all", label: "All Tasks" }
          }
          setSelected={(option) => {
            // @ts-ignore
            if (option?.value === "all") {
              setTask(undefined);
              return;
            }
            let task = tasks.find((a) => a.id === option?.value);
            setTask(task);
          }}
        />
      </View>
      <AnalyticsScreen task={task} />
    </SafeAreaView>
  );
}

function SelectTask({
  tasks,
  selected,
  setSelected,
}: {
  tasks: Task[];
  selected: { value: string; label: string } | undefined;
  setSelected: (option: { value: string; label: string } | undefined) => void;
}) {
  return (
    <Select
      value={selected}
      onValueChange={setSelected}
      defaultValue={{ value: "all", label: "All Tasks" }}
    >
      <SelectTrigger className="w-[150px]">
        <SelectValue
          className="text-foreground text-sm native:text-lg"
          placeholder="Select a task"
        />
      </SelectTrigger>
      <SelectContent className="w-[250px]">
        <SelectGroup>
          <SelectLabel>Tasks</SelectLabel>
          <SelectItem label="All Tasks" value="all">
            All Tasks
          </SelectItem>
          {tasks.map((task) => (
            <SelectItem key={task.id} value={task.id} label={task.title}>
              {task.title}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
