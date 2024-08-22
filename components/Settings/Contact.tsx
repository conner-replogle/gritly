import React, { useContext } from "react";

import { Text } from "~/components/ui/text";
import { Pressable, View, StyleSheet, Linking } from "react-native";
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
import { Link } from "expo-router";
import { Button } from "~/components/ui/button";

export default function Contact() {
  return (
    <View className=" mb-20">
      {/*<a href={"mail:gritly-support@replogle.dev"}>Support Email</a>*/}
      <Button
        size="sm"
        variant="link"
        onPress={() => {
          Linking.openURL("https://gritly.replogle.dev/support");
        }}
      >
        <Text>Support</Text>
      </Button>
      <Button
        size="sm"
        variant="link"
        onPress={() => {
          Linking.openURL("https://gritly.replogle.dev");
        }}
      >
        <Text>Website</Text>
      </Button>
      <Button
        size="sm"
        variant="link"
        onPress={() => {
          Linking.openURL("https://gritly.replogle.dev/privacy");
        }}
      >
        <Text>Privacy Policy</Text>
      </Button>
      <Button
        size="sm"
        variant="link"
        onPress={() => {
          Linking.openURL(
            "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
          );
        }}
      >
        <Text>EULA</Text>
      </Button>
    </View>
  );
}
