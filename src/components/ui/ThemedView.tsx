import React from "react";
import { View, type ViewProps } from "react-native";
import { useSettingsStore } from "../../stores/settingsStore";
import { Colors } from "../../theme";

interface Props extends ViewProps {
  variant?: "background" | "card" | "cardSecondary";
}

export function ThemedView({ variant = "background", style, ...props }: Props) {
  const isDark = useSettingsStore((s) => s.isDarkMode);
  const palette = isDark ? Colors.dark : Colors.light;
  const bg = palette[variant];
  return <View style={[{ backgroundColor: bg }, style]} {...props} />;
}
