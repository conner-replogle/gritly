import { Text } from "~/components/ui/text";
import useTasks from "~/components/hooks/Tasks";
import { TaskCard } from "~/components/Task/taskCard";
import { FlatList, ScrollView, View } from "react-native";

export default function Tasks() {
  const tasks = useTasks();

  return (
    <View className="p-5 h-full">
      <FlatList
        className={"flex-1"}
        data={tasks}
        renderItem={({ item }) => {
          return (
            <TaskCard
              completable={true}
              onCompletePress={() => {}}
              onCompleteLongPress={() => {}}
              task={item}
              completed={{
                total: 0,
                isCompleted: false,
                completed: [],
              }}
              streak={0}
            />
          );
        }}
      />
    </View>
  );
}
