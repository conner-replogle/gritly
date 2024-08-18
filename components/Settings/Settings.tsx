import { Text } from "~/components/ui/text";
import * as React from "react";

import { View } from "react-native";

import { Label } from "../ui/label";
import { Switch } from "~/components/ui/switch";

import { ThemeToggle } from "~/components/ThemeToggle";

import { useMMKVBoolean, useMMKVString } from "react-native-mmkv";
import Purchase from "~/components/Settings/Purchase";
import ColorSchemeSelector from "~/components/Settings/ColorSchemeSelector";

export function SettingsSheet() {
  const [nuttable, setNuttable] = useMMKVBoolean("settings.nuttable");

  return (
    <View className="flex flex-col p-5 gap-4">
      <View className="flex flex-row justify-between">
        <Text className={"text-2xl"}>Settings</Text>
        {/*<ThemeToggle />*/}
      </View>

      <Text className="text-l font-semibold text-muted-foreground">
        OPTIONS
      </Text>
      <View>
        <View className="flex-row gap-3 items-center">
          <Switch
            nativeID={"explosion"}
            checked={nuttable ?? false}
            onCheckedChange={(value) => {
              setNuttable(value);
            }}
          />
          <Label
            nativeID="explosion"
            onPress={() => {
              setNuttable(!nuttable);
            }}
            className={"text-lg"}
          >
            Confetti
          </Label>
        </View>
      </View>

      <ColorSchemeSelector />

      <Purchase />
    </View>
  );
}
