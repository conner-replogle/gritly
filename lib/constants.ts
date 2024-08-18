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
    pro: false,
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

    pro: false,
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
    pro: true,
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
  orange: {
    dark: true,
    pro: true,
    colors: {
      background: "hsl(30 63.7% 4.24%)", // background
      border: "hsl(30 49% 15.9%)", // border
      card: "hsl(30 45.4% 6.89%)", // card
      notification: "hsl(0 62.8% 30.6%)", // destructive
      primary: "hsl(30 98% 53%)", // primary
      text: "hsl(30 9.8% 97.65%)", // foreground
    },
    style: vars({
      "--background": "30 63.7% 4.24%",
      "--foreground": "30 9.8% 97.65%",
      "--card": "30 45.4% 6.89%",
      "--card-foreground": "30 9.8% 97.65%",
      "--popover": "30 45.4% 6.89%",
      "--popover-foreground": "30 9.8% 97.65%",
      "--primary": "30 98% 53%",
      "--primary-foreground": "30 9.8% 5.3%",
      "--secondary": "30 49% 15.9%",
      "--secondary-foreground": "30 9.8% 97.65%",
      "--muted": "30 49% 15.9%",
      "--muted-foreground": "30 9.8% 55.3%",
      "--accent": "30 49% 15.9%",
      "--accent-foreground": "30 9.8% 97.65%",
      "--destructive": "0 62.8% 30.6%",
      "--destructive-foreground": "30 9.8% 97.65%",
      "--border": "30 49% 15.9%",
      "--input": "30 49% 15.9%",
      "--ring": "30 98% 53%",
    }),
  },

  pink: {
    dark: false,
    pro: true,
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
  teal: {
    dark: true,
    pro: true,
    colors: {
      background: "hsl(169 65% 3.84%)", // background
      border: "hsl(169 50% 14.4%)", // border
      card: "hsl(169 45% 6.24%)", // card
      notification: "hsl(0 62.8% 30.6%)", // destructive
      primary: "hsl(169 100% 48%)", // primary
      text: "hsl(169 10% 97.4%)", // foreground
    },
    style: vars({
      "--background": "169 65% 3.84%",
      "--foreground": "169 10% 97.4%",
      "--card": "169 45% 6.24%",
      "--card-foreground": "169 10% 97.4%",
      "--popover": "169 45% 6.24%",
      "--popover-foreground": "169 10% 97.4%",
      "--primary": "169 100% 48%",
      "--primary-foreground": "169 10% 4.8%",
      "--secondary": "169 50% 14.4%",
      "--secondary-foreground": "169 10% 97.4%",
      "--muted": "169 50% 14.4%",
      "--muted-foreground": "169 10% 54.8%",
      "--accent": "169 50% 14.4%",
      "--accent-foreground": "169 10% 97.4%",
      "--destructive": "0 62.8% 30.6%",
      "--destructive-foreground": "169 10% 97.4%",
      "--border": "169 50% 14.4%",
      "--input": "169 50% 14.4%",
      "--ring": "169 100% 48%",
    }),
  },
  neon_pink: {
    dark: true,
    pro: true,
    colors: {
      background: "hsl(300 65% 3.36%)", // background
      border: "hsl(300 50% 12.6%)", // border
      card: "hsl(300 45% 5.46%)", // card
      notification: "hsl(0 62.8% 30.6%)", // destructive
      primary: "hsl(300 100% 42%)", // primary
      text: "hsl(300 10% 97.1%)", // foreground
    },
    style: vars({
      "--background": "300 65% 3.36%",
      "--foreground": "300 10% 97.1%",
      "--card": "300 45% 5.46%",
      "--card-foreground": "300 10% 97.1%",
      "--popover": "300 45% 5.46%",
      "--popover-foreground": "300 10% 97.1%",
      "--primary": "300 100% 42%",
      "--primary-foreground": "300 10% 97.1%",
      "--secondary": "300 50% 12.6%",
      "--secondary-foreground": "300 10% 97.1%",
      "--muted": "300 50% 12.6%",
      "--muted-foreground": "300 10% 54.2%",
      "--accent": "300 50% 12.6%",
      "--accent-foreground": "300 10% 97.1%",
      "--destructive": "0 62.8% 30.6%",
      "--destructive-foreground": "300 10% 97.1%",
      "--border": "300 50% 12.6%",
      "--input": "300 50% 12.6%",
      "--ring": "300 100% 42%",
    }),
  },
};
