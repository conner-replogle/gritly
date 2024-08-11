import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import {
  AreaChart,
  CalendarIcon,
  LineChart,
  ListIcon,
  PlusCircleIcon,
  Settings,
} from "lucide-react-native";
import { useTheme } from "@react-navigation/native";
import { Button, Pressable, View } from "react-native";
import { Text } from "~/components/ui/text";
import { AddHabitsIcon } from "~/components/AddHabit/AddHabits";
export default function TabLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,

        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="habits"
        options={{
          title: "Habits",

          tabBarIcon: ({ color }) => <ListIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "Add",
          headerShown: false,

          tabBarButton: (props) => (
            <View className="mx-3">
              <AddHabitsIcon
                color={colors.background}
                fill={colors.primary}
                size={55}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="analytics"
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => <LineChart color={color} />,
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          headerShown: false,
          tabBarIcon: ({ color }) => <Settings color={color} />,
        }}
      />
    </Tabs>
  );
}
