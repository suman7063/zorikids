import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../../theme";
import { useSettingsStore } from "../../stores/settingsStore";

interface Props {
  streak: number;
  compact?: boolean;
}

export function StreakBadge({ streak, compact = false }: Props) {
  const isDark = useSettingsStore((s) => s.isDarkMode);
  const palette = isDark ? Colors.dark : Colors.light;

  if (compact) {
    return (
      <View style={[styles.compactBadge, { backgroundColor: "#FFF7ED" }]}>
        <Text style={styles.fire}>🔥</Text>
        <Text style={[styles.compactText, { color: "#F97316" }]}>{streak}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.badge, { backgroundColor: palette.card }]}>
      <Text style={styles.fireLarge}>🔥</Text>
      <View>
        <Text style={[styles.label, { color: palette.textMuted }]}>Current Streak</Text>
        <Text style={[styles.count, { color: "#F97316" }]}>{streak} days</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 16,
  },
  fireLarge: { fontSize: 32 },
  label: { fontSize: 12, fontWeight: "500" },
  count: { fontSize: 22, fontWeight: "800" },
  compactBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  fire: { fontSize: 16 },
  compactText: { fontSize: 15, fontWeight: "700" },
});
