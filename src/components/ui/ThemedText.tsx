import React from "react";
import { Text, type TextProps, StyleSheet } from "react-native";
import { useSettingsStore } from "../../stores/settingsStore";
import { Colors } from "../../theme";

interface Props extends TextProps {
  variant?: "heading" | "title" | "body" | "caption" | "muted";
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
}

const sizes = {
  xs: 11, sm: 13, base: 15, lg: 17, xl: 20, "2xl": 24, "3xl": 30, "4xl": 36,
};

export function ThemedText({ variant = "body", size, style, ...props }: Props) {
  const isDark = useSettingsStore((s) => s.isDarkMode);
  const palette = isDark ? Colors.dark : Colors.light;

  const colorMap = {
    heading: palette.text,
    title: palette.text,
    body: palette.text,
    caption: palette.textMuted,
    muted: palette.textLight,
  };

  const weightMap = {
    heading: "800" as const,
    title: "700" as const,
    body: "400" as const,
    caption: "500" as const,
    muted: "400" as const,
  };

  const defaultSizes = {
    heading: 28, title: 20, body: 15, caption: 13, muted: 12,
  };

  return (
    <Text
      style={[
        {
          color: colorMap[variant],
          fontWeight: weightMap[variant],
          fontSize: size ? sizes[size] : defaultSizes[variant],
        },
        style,
      ]}
      {...props}
    />
  );
}
