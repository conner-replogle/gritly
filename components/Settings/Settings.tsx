import { Bold, SettingsIcon } from "lucide-react-native";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import * as React from "react";
import { useCallback, useRef } from "react";
import { LayoutAnimation, Linking, View } from "react-native";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useTheme } from "@react-navigation/native";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { Label } from "../ui/label";
import { Switch } from "~/components/ui/switch";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAndroidNavigationBar } from "~/lib/android-navigation-bar";
import { useColorScheme } from "~/lib/useColorScheme";

import { Pressable } from "react-native";
import { MoonStar } from "~/lib/icons/MoonStar";
import { Sun } from "~/lib/icons/Sun";
import { cn } from "~/lib/utils";
import { ThemeToggle } from "~/components/ThemeToggle";
import Svg, { Path } from "react-native-svg";
import { Toggle, ToggleIcon } from "~/components/ui/toggle";
import { useMMKVBoolean, useMMKVString } from "react-native-mmkv";
import Purchase from "~/components/Settings/Purchase";
import theme from "tailwindcss/defaultTheme";
export default function SettingsButton() {
  const { colors } = useTheme();
  const { isDarkColorScheme, setColorScheme } = useColorScheme();
  const toggleColorScheme = useCallback(() => {
    const newTheme = isDarkColorScheme ? "light" : "dark";
    setColorScheme(newTheme);
    setAndroidNavigationBar(newTheme);
    AsyncStorage.setItem("theme", newTheme);
  }, []);

  const ref = useRef<BottomSheetModalMethods | null>(null);

  return (
    <>
      <BottomSheetModal
        handleHeight={5}
        ref={ref}
        keyboardBehavior="interactive"
        snapPoints={["90%"]}
        handleIndicatorStyle={{
          backgroundColor: colors.border,
        }}
        backgroundStyle={{
          backgroundColor: colors.background,
        }}
        onAnimate={(_, index) => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        }}
      >
        <BottomSheetView>
          <SettingsSheet />
        </BottomSheetView>
      </BottomSheetModal>
      <Button
        className="aspect-square"
        variant={"ghost"}
        size="sm"
        onPress={() => {
          ref.current?.present();
        }}
      >
        <SettingsIcon color={colors.primary} />
      </Button>
    </>
  );
}

function SettingsSheet() {
  const [nuttable, setNuttable] = useMMKVBoolean("settings.nuttable");

  return (
    <View className="flex flex-col p-5 gap-4">
      <View className="flex flex-row justify-between">
        <Text className={"text-2xl"}>Settings</Text>
        <ThemeToggle />
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

      <Purchase />
    </View>
  );
}
