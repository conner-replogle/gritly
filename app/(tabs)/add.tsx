import { Text } from "~/components/ui/text";
import { SettingsSheet } from "~/components/Settings/Settings";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Settings() {
  return (
    <SafeAreaView>
      <SettingsSheet />
    </SafeAreaView>
  );
}
