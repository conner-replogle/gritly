import { createContext } from "react";

export const ExplosionContext = createContext(() => {
  console.log("nut");
});
export const SubscriptionContext = createContext({
  active: false,
  sku: "",
});
