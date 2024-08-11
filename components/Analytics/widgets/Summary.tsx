import { Completed } from "~/models/Completed";
import { Habit } from "~/models/Habit";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { Clipboard } from "lucide-react-native";
import { useTheme } from "@react-navigation/native";
import { Analytics } from "~/lib/hooks/Analytics";

export function Summary({ analytics }: { analytics: Analytics }) {
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
      <View
        style={{
          marginTop: 10,
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          marginRight: 30,
        }}
      >
        <View className="grow flex-col justify-between gap-2">
          <Text className="font-semibold text-sm text-muted-foreground">
            SUCCESS RATE
          </Text>
          <Text className="text-green-500 ">
            {(
              (analytics.completed /
                (analytics.completed + analytics.uncompleted)) *
              100
            ).toPrecision(4)}
            %
          </Text>
          <Text className="font-semibold text-sm text-muted-foreground">
            TOTAL
          </Text>
          <Text className=" ">{analytics.total}</Text>
          <Text className="font-semibold text-sm text-muted-foreground">
            SKIPPED
          </Text>
          <Text className="text-green-500 ">{analytics.skipped}</Text>
        </View>
        <View className="grow flex-col justify-between gap-2">
          <Text className="font-semibold text-sm text-muted-foreground">
            COMPLETED
          </Text>
          <Text className=" ">{analytics.completed}</Text>
          <Text className="font-semibold text-sm text-muted-foreground">
            BEST STREAK DAY
          </Text>
          <Text className="">22</Text>
          <Text className="font-semibold text-sm text-muted-foreground">
            FAILED
          </Text>
          <Text className="text-red-500">
            {analytics.uncompleted + analytics.skipped}
          </Text>
        </View>
      </View>
    </View>
  );
}
