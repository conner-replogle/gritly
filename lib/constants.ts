import { Theme } from "@react-navigation/native";
import { StyleSheet } from "react-native";
import { vars } from "nativewind";

export const NAV_THEME = {
  light: {
    background: "hsl(0 0% 100%)", // background
    border: "hsl(240 5.9% 90%)", // border
    card: "hsl(0 0% 100%)", // card
    notification: "hsl(0 84.2% 60.2%)", // destructive
    primary: "hsl(240 5.9% 10%)", // primary
    text: "hsl(240 10% 3.9%)", // foreground
  },
  dark: {
    background: "hsl(240 10% 3.9%)", // background
    border: "hsl(240 3.7% 15.9%)", // border
    card: "hsl(240 10% 3.9%)", // card
    notification: "hsl(0 72% 51%)", // destructive
    primary: "hsl(0 0% 98%)", // primary
    text: "hsl(0 0% 98%)", // foreground
  },
};

export const Themes = {
  light: {
    dark: false,
    colors: NAV_THEME.light,
    style: vars({
      "--background": "0 0% 100%",
      "--foreground": "240 10% 3.9%",
      "--card": "0 0% 100%",
      "--card-foreground": "240 10% 3.9%",
      "--popover": "0 0% 100%",
      "--popover-foreground": "240 10% 3.9%",
      "--primary": "240 5.9% 10%",
      "--primary-foreground": "0 0% 98%",
      "--secondary": "240 5.9% 94%",
      "--secondary-foreground": "240 5.9% 10%",
      "--muted": "240 4.8% 95.9%",
      "--muted-foreground": "240 3.8% 46.1%",
      "--accent": "240 4.8% 95.9%",
      "--accent-foreground": "240 5.9% 10%",
      "--destructive": "0 84.2% 60.2%",
      "--destructive-foreground": "0 0% 98%",
      "--border": "240 5.9% 90%",
      "--input": "240 5.9% 90%",
      "--ring": "240 5.9% 10%",
    }),
  },
  dark: {
    dark: true,
    colors: NAV_THEME.dark,
    style: vars({
      "--background": "240 10% 3.9%",
      "--foreground": "0 0% 98%",
      "--card": "240 10% 3.9%",
      "--card-foreground": "0 0% 98%",
      "--popover": "240 10% 3.9%",
      "--popover-foreground": "0 0% 98%",
      "--primary": "0 0% 98%",
      "--primary-foreground": "240 5.9% 10%",
      "--secondary": "240 3.7% 15.9%",
      "--secondary-foreground": "0 0% 98%",
      "--muted": "240 3.7% 15.9%",
      "--muted-foreground": "240 5% 64.9%",
      "--accent": "240 3.7% 15.9%",
      "--accent-foreground": "0 0% 98%",
      "--destructive": "0 72% 51%",
      "--destructive-foreground": "0 0% 98%",
      "--border": "240 3.7% 15.9%",
      "--input": "240 3.7% 15.9%",
      "--ring": "240 4.9% 83.9%",
    }),
  },

  autumn: {
    dark: true,
    colors: {
      primary: "#A52A2A", // Brown
      border: "#FF8C00", // Dark Orange
      background: "hsl(36, 80%, 80%)", // Wheat
      notification: "#B22222", // Firebrick
      text: "#2F4F4F", // Dark Slate Gray
      card: "#F4A460", // Sandy Brown
    },
    style: vars({
      "--background": "36 80% 80%",
      "--foreground": "160 25% 15%",
      "--card": "29 87% 74%",
      "--card-foreground": "160 25% 15%",
      "--popover": "36 80% 80%",
      "--popover-foreground": "160 25% 15%",
      "--primary": "0 59% 41%",
      "--primary-foreground": "29 87% 74%",
      "--secondary": "29 87% 53%",
      "--secondary-foreground": "160 25% 15%",
      "--muted": "29 87% 53%",
      "--muted-foreground": "0 59% 41%",
      "--accent": "0 72% 33%",
      "--accent-foreground": "0 0% 100%",
      "--destructive": "0 72% 51%",
      "--destructive-foreground": "0 0% 100%",
      "--border": "29 87% 53%",
      "--input": "29 87% 53%",
      "--ring": "29 87% 53%",
    }),
  },
  pink: {
    dark: false,
    colors: {
      primary: "#FF69B4", // Hot Pink
      border: "#FFB6C1", // Light Pink
      background: "hsl(330, 100%, 95%)", // Light Pink
      notification: "#FF1493", // Deep Pink
      text: "#C71585", // Medium Violet Red
      card: "#FFC0CB", // Pink
    },
    style: vars({
      "--background": "330 100% 95%",
      "--foreground": "330 100% 25%",
      "--card": "340 85% 85%",
      "--card-foreground": "330 100% 25%",
      "--popover": "340 85% 85%",
      "--popover-foreground": "330 100% 25%",
      "--primary": "340 85% 65%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "330 100% 75%",
      "--secondary-foreground": "340 85% 35%",
      "--muted": "340 85% 75%",
      "--muted-foreground": "340 85% 35%",
      "--accent": "330 100% 75%",
      "--accent-foreground": "340 85% 35%",
      "--destructive": "350 85% 47%",
      "--destructive-foreground": "0 0% 100%",
      "--border": "340 85% 75%",
      "--input": "330 100% 75%",
      "--ring": "340 85% 65%",
    }),
  },
  christmas: {
    dark: false,
    colors: {
      primary: "#FF0000", // Christmas Red
      border: "#FFD700", // Gold
      background: "hsl(140, 56%, 53%)", // Christmas Green
      notification: "#FF0000", // Christmas Red
      text: "#FFFFFF", // White
      card: "#FF0000", // Christmas Red
    },
    style: vars({
      "--background": "140 56% 53%" /* Christmas Green */,
      "--foreground": "0 0% 100%" /* White */,
      "--card": "0 72% 51%" /* Christmas Red */,
      "--card-foreground": "0 0% 100%" /* White */,
      "--popover": "140 56% 53%" /* Christmas Green */,
      "--popover-foreground": "0 0% 100%" /* White */,
      "--primary": "0 72% 51%" /* Christmas Red */,
      "--primary-foreground": "0 0% 100%" /* White */,
      "--secondary": "60 70% 80%" /* Gold */,
      "--secondary-foreground": "0 72% 51%" /* Christmas Red */,
      "--muted": "0 72% 51%" /* Christmas Red */,
      "--muted-foreground": "60 70% 80%" /* Gold */,
      "--accent": "0 72% 51%" /* Christmas Red */,
      "--accent-foreground": "0 0% 100%" /* White */,
      "--destructive": "0 72% 51%" /* Christmas Red */,
      "--destructive-foreground": "0 0% 100%" /* White */,
      "--border": "60 70% 80%" /* Gold */,
      "--input": "0 72% 51%" /* Christmas Red */,
      "--ring": "60 70% 80%" /* Gold */,
    }),
  },
};
