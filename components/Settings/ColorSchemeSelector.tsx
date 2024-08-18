import React, { useContext, useEffect, useState } from "react";
import { Button } from "~/components/ui/button";

import { Text } from "~/components/ui/text";
import { Pressable, View, StyleSheet } from "react-native";
import Purchases, { PurchasesPackage } from "react-native-purchases";
import { ColorThemeContext, log, SubscriptionContext } from "~/lib/config";
import { Themes } from "~/lib/constants";
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Stop,
} from "react-native-svg";
import { useTheme } from "@react-navigation/native";
import { useColorScheme } from "nativewind";

function ThemeItem(props: {
  onPress: () => void;
  theme: string;
  selected: boolean;
  pro: boolean;
}) {
  return (
    <Pressable
      className={"h-20 w-20 items-center"}
      onPress={props.onPress}
      style={{}}
    >
      <DiagonalCircleSVG
        primaryColor={Themes[props.theme as keyof typeof Themes].colors.primary}
        secondaryColor={
          Themes[props.theme as keyof typeof Themes].colors.background
        }
        size={props.selected ? 30 : 25}
        thickness={5}
      />
      <View className="flex-col mt-auto gap-0 flex-1 justify-start items-center">
        {props.pro && (
          <Text className={props.selected ? "font-semibold" : ""}>Pro</Text>
        )}
        <Text className={props.selected ? "font-semibold" : ""}>
          {props.theme}
        </Text>
      </View>
    </Pressable>
  );
}

export default function ColorSchemeSelector() {
  const { colorTheme, setColorTheme } = useContext(ColorThemeContext);
  const subscription = useContext(SubscriptionContext);

  return (
    <View className="gap-2 flex-col">
      <Text className="text-l font-semibold text-muted-foreground">
        COLOR SCHEME
      </Text>

      <View className={"flex-row gap-3 items-center justify-start flex-wrap"}>
        {Object.keys(Themes).map((theme) => (
          <ThemeItem
            key={theme}
            pro={Themes[theme as keyof typeof Themes].pro}
            onPress={() => {
              setColorTheme(theme as keyof typeof Themes);
            }}
            theme={theme}
            selected={colorTheme === theme}
          />
        ))}
      </View>
    </View>
  );
}

const DiagonalCircleSVG = ({
  primaryColor = "red",
  secondaryColor = "blue",
  size = 200,
  thickness = 5,
}) => {
  const { colorScheme } = useColorScheme();
  const strokeColor = colorScheme === "dark" ? "white" : "black";
  const strokeWidth = size * thickness * 0.01; // 5% of the size for the stroke width
  const radius = size / 2 - strokeWidth; // Radius to fit within the viewBox considering the stroke
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="49.5%" stopColor={primaryColor} />

            <Stop offset="50.5%" stopColor={secondaryColor} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="url(#grad)"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
        <Line
          x1={size / 2 - Math.cos(Math.PI / 4) * radius}
          y1={size / 2 + Math.cos(Math.PI / 4) * radius}
          x2={size / 2 + Math.cos(Math.PI / 4) * radius}
          y2={size / 2 - Math.cos(Math.PI / 4) * radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      </Svg>
    </View>
  );
};
