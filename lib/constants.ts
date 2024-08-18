import { Theme } from "@react-navigation/native";

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

export interface ThemeData {
  name: string;
  theme: Theme;
}

export const Themes = {
  light: {
    dark: false,
    colors: NAV_THEME.light,
  },
  dark: {
    dark: true,
    colors: NAV_THEME.dark,
  },

  autumn: {
    dark: false,
    colors: {
      primary: "#A52A2A", // Brown
      border: "#FF8C00", // Dark Orange
      background: "hsl(36, 80%, 80%)", // Wheat
      notification: "#B22222", // Firebrick
      text: "#2F4F4F", // Dark Slate Gray
      card: "#F4A460", // Sandy Brown
    },
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
  },
};
