import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { Colors, ACTIVITY_META, Shadow } from "../../theme";
import type { ActivityType } from "../../types";
import { useSettingsStore } from "../../stores/settingsStore";

interface Props {
  type: ActivityType;
  title: string;
  subtitle?: string;
  duration?: string;
  xp?: number;
  locked?: boolean;
  onPress: () => void;
  size?: "sm" | "md" | "lg";
}

export function ActivityCard({
  type,
  title,
  subtitle,
  xp,
  locked = false,
  onPress,
  size = "md",
}: Props) {
  const isDark = useSettingsStore((s) => s.isDarkMode);
  const meta = ACTIVITY_META[type];
  const activityColors = Colors.activity[type];
  const palette = isDark ? Colors.dark : Colors.light;

  const handlePress = () => {
    if (locked) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const cardWidth = size === "sm" ? 140 : size === "lg" ? "100%" : 160;

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={locked ? 1 : 0.85}
      style={[
        styles.card,
        {
          width: cardWidth as any,
          backgroundColor: isDark ? palette.card : "#FFFFFF",
          opacity: locked ? 0.6 : 1,
          ...Shadow.md,
          shadowColor: activityColors.icon,
        },
      ]}
    >
      <View
        style={[
          styles.iconBg,
          { backgroundColor: isDark ? palette.cardSecondary : activityColors.bg },
        ]}
      >
        <Text style={styles.emoji}>{meta.emoji}</Text>
      </View>

      <Text
        style={[styles.title, { color: isDark ? palette.text : activityColors.text }]}
        numberOfLines={2}
      >
        {title}
      </Text>

      {subtitle && (
        <Text style={[styles.subtitle, { color: palette.textMuted }]} numberOfLines={1}>
          {subtitle}
        </Text>
      )}

      <View style={styles.footer}>
        <Text style={[styles.duration, { color: palette.textMuted }]}>
          ⏱ {meta.duration}
        </Text>
        {xp && (
          <View style={[styles.xpBadge, { backgroundColor: activityColors.bg }]}>
            <Text style={[styles.xpText, { color: activityColors.icon }]}>
              +{xp} XP
            </Text>
          </View>
        )}
        {locked && <Text style={styles.lock}>🔒</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    gap: 8,
  },
  iconBg: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    fontSize: 28,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  duration: {
    fontSize: 12,
    flex: 1,
  },
  xpBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  xpText: {
    fontSize: 11,
    fontWeight: "700",
  },
  lock: {
    fontSize: 14,
  },
});
