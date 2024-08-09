import { CompletedResult } from "~/models/CompletedResult";
import { Task } from "~/models/Task";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { Clipboard } from "lucide-react-native";
import { useTheme } from "@react-navigation/native";

export function Summary() {
  const { colors } = useTheme();
  return (
    <View className="bg-background w-full p-5 rounded-xl">
      <View className="flex-row items-center">
        <Clipboard className="aspect-square" size={32} color={colors.primary} />
        <View
          style={{
            marginLeft: 10,
          }}
          className="flex-col "
        >
          <Text className="font-semibold">All Habits</Text>
          <Text className="text-sm">Summary</Text>
        </View>
      </View>
      <View style={{ marginTop: 10 }} className="flex-row">
        <View className="grow flex-col justify-between gap-2">
          <Text className="font-semibold text-sm text-muted-foreground">
            SUCCESS RATE
          </Text>
          <Text className="text-green-500 ">98%</Text>
          <Text className="font-semibold text-sm text-muted-foreground">
            POINTS EARNED
          </Text>
          <Text className="text-green-500 ">98%</Text>
          <Text className="font-semibold text-sm text-muted-foreground">
            SKIPPED
          </Text>
          <Text className="text-green-500 ">98%</Text>
        </View>
        <View className="grow flex-col justify-between gap-2">
          <Text className="font-semibold text-sm text-muted-foreground">
            SUCCESS RATE
          </Text>
          <Text className="text-green-500 ">98%</Text>
          <Text className="font-semibold text-sm text-muted-foreground">
            POINTS EARNED
          </Text>
          <Text className="text-green-500 ">98%</Text>
          <Text className="font-semibold text-sm text-muted-foreground">
            SKIPPED
          </Text>
          <Text className="text-green-500 ">98%</Text>
        </View>
      </View>
    </View>
  );
}
