import { createContext } from "react";
import { logger } from "react-native-logs";

export const ExplosionContext = createContext(() => {
  log.debug("nut");
});
export const SubscriptionContext = createContext({
  active: false,
  sku: "",
});
export const log = logger.createLogger();
