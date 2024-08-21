import React, { useContext } from "react";

import { Text } from "~/components/ui/text";
import { Pressable, View, StyleSheet } from "react-native";
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
import { Crown, XCircleIcon } from "lucide-react-native";

function ThemeItem(props: {
  onPress: () => void;
  theme: string;
  selected: boolean;
  pro: boolean;
  userPro: boolean;
}) {
  const { colors } = useTheme();
  function getBackgroundColor() {
    if ((props.pro && !props.userPro) || props.selected) {
      return colors.border;
    }

    return colors.background;
  }
  return (
    <Pressable
      className={
        "aspect-square w-16 p-3  rounded-xl flex-col justify-center items-center"
      }
      disabled={props.pro && !props.userPro}
      onPress={props.onPress}
      style={{
        backgroundColor: getBackgroundColor(),
      }}
    >
      <DiagonalCircleSVG
        primaryColor={Themes[props.theme as keyof typeof Themes].colors.primary}
        secondaryColor={
          Themes[props.theme as keyof typeof Themes].colors.background
        }
        size={props.selected ? 30 : 25}
        thickness={5}
      />
      {props.pro && !props.userPro && (
        <View className={"absolute w-full h-full justify-center items-center"}>
          <Crown size={32} color="yellow" />
        </View>
      )}
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
            userPro={subscription?.active}
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
