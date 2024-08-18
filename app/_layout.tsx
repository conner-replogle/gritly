import "../global.css";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeProvider } from "@react-navigation/native";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { Platform, View } from "react-native";
import { Themes } from "~/lib/constants";
import { useColorScheme } from "~/lib/useColorScheme";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import { ColorThemeContext, log, SubscriptionContext } from "~/lib/config";
import { useEffect } from "react";
import { PortalHost } from "@rn-primitives/portal";
import { database } from "~/lib/watermelon";
import { DatabaseProvider } from "@nozbe/watermelondb/react";
import { setAndroidNavigationBar } from "~/lib/android-navigation-bar";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

// Prevent the splash screen from auto-hiding before getting the color scheme.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme, setColorScheme, isDarkColorScheme } = useColorScheme();

  const [theme, setTheme] = React.useState<keyof typeof Themes>("light");
  const [subscription, setSubscription] = React.useState({
    active: false,
    sku: "",
  });
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

  React.useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

    if (Platform.OS === "ios") {
      Purchases.configure({ apiKey: "appl_olIiJisoQvuIrQgmmzXHYdcnrnY" });
    }
  }, []);

  React.useEffect(() => {
    (async () => {
      const theme = await AsyncStorage.getItem("theme");
      if (Platform.OS === "web") {
        // Adds the background color to the html element to prevent white background on overscroll.
        document.documentElement.classList.add("bg-background");
      }
      if (!theme) {
        AsyncStorage.setItem("theme", colorScheme);
        setIsColorSchemeLoaded(true);
        return;
      }
      // @ts-ignore
      let colorTheme: "light" | "dark" = Themes[theme].dark ? "dark" : "light";
      if (colorTheme !== colorScheme) {
        setColorScheme(colorTheme);
      }
      // @ts-ignore
      setTheme(theme);

      setIsColorSchemeLoaded(true);
    })().finally(() => {
      SplashScreen.hideAsync();
    });
  }, []);
  useEffect(() => {
    Purchases.addCustomerInfoUpdateListener((info) => {
      if (info.activeSubscriptions.includes("pro")) {
        setSubscription({
          active: true,
          sku: "pro",
        });
      }
    });
  }, []);

  if (!isColorSchemeLoaded) {
    return null;
  }
  console.log(theme);

  return (
    <GestureHandlerRootView>
      <ThemeProvider value={Themes[theme]}>
        <Theme theme={theme as keyof typeof Themes}>
          <ColorThemeContext.Provider
            value={{
              colorTheme: theme,
              setColorTheme: (newTheme) => {
                log.debug(`Setting color theme to ${newTheme}`);
                let raw: "light" | "dark" = Themes[newTheme].dark
                  ? "dark"
                  : "light";
                setTheme(newTheme);
                setColorScheme(raw);
                setAndroidNavigationBar(raw);
                AsyncStorage.setItem("theme", newTheme);
              },
            }}
          >
            <DatabaseProvider database={database}>
              <SubscriptionContext.Provider value={subscription}>
                <BottomSheetModalProvider>
                  <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
                  <Stack>
                    <Stack.Screen
                      name="(tabs)"
                      options={{ headerShown: false }}
                    />
                  </Stack>
                </BottomSheetModalProvider>

                <PortalHost />
              </SubscriptionContext.Provider>
            </DatabaseProvider>
          </ColorThemeContext.Provider>
        </Theme>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function Theme(props: {
  theme: keyof typeof Themes;
  children: React.ReactNode;
}) {
  return (
    <View className="flex-1" style={Themes[props.theme].style}>
      {props.children}
    </View>
  );
}
