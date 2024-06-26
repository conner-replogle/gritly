import { SettingsIcon } from "lucide-react-native";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import * as React from "react";
import { useCallback, useRef } from "react";
import { LayoutAnimation, View } from "react-native";
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
          <View className="flex flex-col p-5 gap-4">
            <View className="flex flex-row justify-between">
              <Text className={"text-2xl"}>Settings</Text>
              <ThemeToggle />
            </View>
          </View>
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
        <SettingsIcon />
      </Button>
    </>
  );
}
