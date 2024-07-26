import "~/global.css";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Theme, ThemeProvider } from "@react-navigation/native";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { Platform } from "react-native";
import { NAV_THEME } from "~/lib/constants";
import { useColorScheme } from "~/lib/useColorScheme";
import { PortalHost } from "~/components/primitives/portal";
import { RealmProvider } from "@realm/react";
import { Completed, Goal, Task, Repeat } from "~/lib/states/task";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import { log, SubscriptionContext } from "~/lib/config";
import { useEffect } from "react";
import { logger } from "react-native-logs";

const LIGHT_THEME: Theme = {
  dark: false,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  dark: true,
  colors: NAV_THEME.dark,
};

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

// Prevent the splash screen from auto-hiding before getting the color scheme.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme, setColorScheme, isDarkColorScheme } = useColorScheme();
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
      const colorTheme = theme === "dark" ? "dark" : "light";
      if (colorTheme !== colorScheme) {
        setColorScheme(colorTheme);

        setIsColorSchemeLoaded(true);
        return;
      }
      setIsColorSchemeLoaded(true);
    })().finally(() => {
      SplashScreen.hideAsync();
    });
  }, []);
  useEffect(() => {
    const CheckSubscription = async () => {
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        // access latest customerInfo
        log.debug(customerInfo.activeSubscriptions);
        if (customerInfo.activeSubscriptions.includes("pro")) {
          setSubscription({
            active: true,
            sku: "pro",
          });
        }
      } catch (e) {
        // Error fetching customer info
        log.error(e);
      }
    };
    CheckSubscription();
  }, []);

  if (!isColorSchemeLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView>
      <RealmProvider
        schema={[Task, Repeat, Completed, Goal]}
        deleteRealmIfMigrationNeeded
      >
        <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
          <SubscriptionContext.Provider value={subscription}>
            <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
            <BottomSheetModalProvider>
              <Stack>
                <Stack.Screen
                  name="index"
                  options={{
                    headerShown: false,
                  }}
                />
              </Stack>
            </BottomSheetModalProvider>

            <PortalHost />
          </SubscriptionContext.Provider>
        </ThemeProvider>
      </RealmProvider>
    </GestureHandlerRootView>
  );
}
