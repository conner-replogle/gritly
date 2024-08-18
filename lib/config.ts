import { createContext } from "react";
import { logger } from "react-native-logs";
import { Themes } from "~/lib/constants";

export const ExplosionContext = createContext(() => {
  log.debug("nut");
});
export const SubscriptionContext = createContext({
  active: false,
  sku: "",
});

export const DateContext = createContext({
  date: new Date(Date.now()),
  setDate: (date: Date) => {
    log.debug(`Setting date to ${date}`);
  },
});

export const ColorThemeContext = createContext({
  colorTheme: "light" as keyof typeof Themes,
  setColorTheme: (theme: keyof typeof Themes) => {
    log.debug(`Setting color theme to ${theme}`);
  },
});

export const log = logger.createLogger();
