import { Text } from "~/components/ui/text";
import useTasks from "~/components/hooks/Tasks";
import { TaskCard } from "~/components/Task/taskCard";
import { FlatList, Pressable, ScrollView, View } from "react-native";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { log } from "~/lib/config";
import {
  EditIcon,
  LineChart,
  PauseIcon,
  Redo2,
  Trash,
} from "lucide-react-native";
import * as React from "react";
import { Task } from "~/models/Task";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { AnalyicsBottomSheet, EditBottomSheet } from "~/components/Task/task";
import { useDatabase } from "@nozbe/watermelondb/hooks";
import { addDays } from "date-fns";

export default function Tasks() {
  const tasks = useTasks();

  return (
    <View className="p-5 h-full">
      <FlatList
        className={"flex-1"}
        data={tasks}
        renderItem={({ item }) => {
          return <TaskCardWithDropdown task={item} />;
        }}
      />
    </View>
  );
}

function TaskCardWithDropdown({ task }: { task: Task }) {
  const editSheetRef = React.useRef<BottomSheetModal>(null);

  const snapPoints = React.useMemo(() => ["90%"], []);
  const database = useDatabase();
  const analyticalSheetRef = React.useRef<BottomSheetModal>(null);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Pressable>
          <TaskCard
            task={task}
            completed={{
              total: 0,
              isCompleted: false,
              completed: [],
            }}
            streak={0}
            completable={true}
            onCompletePress={() => {}}
            onCompleteLongPress={() => {}}
          />
        </Pressable>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {/* Drop Down Menu For task with edit delete reset options */}

        <DropdownMenuGroup>
          <DropdownMenuItem
            onPress={() => {
              editSheetRef.current?.present();
            }}
          >
            <EditIcon size={16} />
            <DropdownMenuLabel>Edit</DropdownMenuLabel>
          </DropdownMenuItem>
          <DropdownMenuItem
            onPress={() => {
              analyticalSheetRef.current?.present();
            }}
          >
            <LineChart size={16} />
            <DropdownMenuLabel>Analytics</DropdownMenuLabel>
          </DropdownMenuItem>
          <DropdownMenuItem
            onPress={async () => {
              await task.endTask(new Date(Date.now()));
            }}
          >
            <PauseIcon size={16} />
            <DropdownMenuLabel>End Task</DropdownMenuLabel>
          </DropdownMenuItem>
          <DropdownMenuItem
            onPress={async () => {
              await database.write(async () => {
                await task.markAsDeleted();
              });
            }}
          >
            <Trash size={16} />
            <DropdownMenuLabel>Delete Task</DropdownMenuLabel>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
      <EditBottomSheet
        bottomSheetRef={editSheetRef}
        snapPoints={snapPoints}
        onDelete={async () => {
          await database.write(async () => {
            await task.markAsDeleted();
          });
          editSheetRef.current?.dismiss();
        }}
        onSubmit={async (atask) => {
          // @ts-ignore
          await database.write(async () => {
            await task.update((a) => {
              a.title = atask.title;
              a.goal = atask.goal;
              a.repeats = atask.repeats;
              a.startsOn = atask.startsOn;
              a.description = atask.description;
              a.color = atask.color;
            });
          });

          editSheetRef.current?.dismiss();
        }}
        task={task.toEditableTask()}
      />
      <AnalyicsBottomSheet
        bottomSheetRef={analyticalSheetRef}
        snapPoints={snapPoints}
        task={task}
      />
    </DropdownMenu>
  );
}
