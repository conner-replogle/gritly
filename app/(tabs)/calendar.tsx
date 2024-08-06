import { Text } from "~/components/ui/text";
import { SettingsSheet } from "~/components/Settings/Settings";
import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "react-native";
import { Calendar } from "react-native-calendars";
import { useTheme } from "@react-navigation/native";

export default function CalendarScreen() {
  const { colors } = useTheme();
  return (
    <SafeAreaView>
      <View>
        <Calendar
          style={{
            backgroundColor: colors.background,
          }}
        />
      </View>
    </SafeAreaView>
  );
}
