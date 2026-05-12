import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type TouchableOpacityProps,
  StyleSheet,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Colors } from "../../theme";

interface Props extends TouchableOpacityProps {
  label: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export function KiddoButton({
  label,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  fullWidth = true,
  onPress,
  style,
  disabled,
  ...props
}: Props) {
  const handlePress = (e: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(e);
  };

  const heights = { sm: 44, md: 54, lg: 64 };
  const fontSizes = { sm: 14, md: 16, lg: 18 };
  const paddings = { sm: 16, md: 24, lg: 28 };
  const radii = { sm: 12, md: 16, lg: 20 };

  const bgColors = {
    primary: Colors.light.primary,
    secondary: Colors.light.secondary,
    outline: "transparent",
    ghost: "transparent",
  };

  const textColors = {
    primary: "#FFFFFF",
    secondary: "#FFFFFF",
    outline: Colors.light.primary,
    ghost: Colors.light.primary,
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[
        {
          height: heights[size],
          backgroundColor: bgColors[variant],
          borderRadius: radii[size],
          paddingHorizontal: paddings[size],
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          alignSelf: fullWidth ? "stretch" : "flex-start",
          borderWidth: variant === "outline" ? 2 : 0,
          borderColor: variant === "outline" ? Colors.light.primary : "transparent",
          opacity: disabled ? 0.5 : 1,
          shadowColor: variant === "primary" ? Colors.light.primary : "transparent",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: variant === "primary" ? 4 : 0,
        },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textColors[variant]} size="small" />
      ) : (
        <>
          {icon}
          <Text
            style={{
              color: textColors[variant],
              fontSize: fontSizes[size],
              fontWeight: "700",
              letterSpacing: 0.3,
            }}
          >
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
