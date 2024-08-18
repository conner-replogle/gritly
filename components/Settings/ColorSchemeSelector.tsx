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

export default function ColorSchemeSelector() {
  const { colorTheme, setColorTheme } = useContext(ColorThemeContext);
  const subscription = useContext(SubscriptionContext);

  return (
    <View className="gap-2 flex-col">
      <Text className="text-l font-semibold text-muted-foreground">
        COLOR SCHEME
      </Text>

      <View className={"flex-row gap-3"}>
        {Object.keys(Themes).map((theme) => (
          <Pressable
            key={theme}
            onPress={() => {
              // if (theme != "light" && theme != "dark" && !subscription.active) {
              //   log.debug("Subscription required for custom themes");
              //   return;
              // }
              setColorTheme(theme as keyof typeof Themes);
            }}
            style={{}}
          >
            <DiagonalCircleSVG
              primaryColor={Themes[theme as keyof typeof Themes].colors.primary}
              secondaryColor={
                Themes[theme as keyof typeof Themes].colors.background
              }
              size={25}
            />
            <Text>{theme}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const DiagonalCircleSVG = ({
  primaryColor = "red",
  secondaryColor = "blue",
  size = 200,
}) => {
  const strokeWidth = size * 0.05; // 5% of the size for the stroke width
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
          stroke="black"
          strokeWidth={strokeWidth}
        />
        <Line
          x1={size / 2 - Math.cos(Math.PI / 4) * radius}
          y1={size / 2 + Math.cos(Math.PI / 4) * radius}
          x2={size / 2 + Math.cos(Math.PI / 4) * radius}
          y2={size / 2 - Math.cos(Math.PI / 4) * radius}
          stroke="black"
          strokeWidth={strokeWidth}
        />
      </Svg>
    </View>
  );
};
