import { createContext } from "react";
import { logger } from "react-native-logs";

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
export const log = logger.createLogger();
