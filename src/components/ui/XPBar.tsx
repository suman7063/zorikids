import React, { useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";
import { Colors } from "../../theme";
import { useSettingsStore } from "../../stores/settingsStore";

interface Props {
  xp: number;
  level: number;
  xpForNext: number;
}

export function XPBar({ xp, level, xpForNext }: Props) {
  const isDark = useSettingsStore((s) => s.isDarkMode);
  const palette = isDark ? Colors.dark : Colors.light;
  const progress = useRef(new Animated.Value(0)).current;

  const pct = Math.min(xp / xpForNext, 1);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: pct,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.levelBadge, { backgroundColor: palette.primary }]}>
          <Text style={styles.levelText}>Lv {level}</Text>
        </View>
        <Text style={[styles.xpText, { color: palette.textMuted }]}>
          {xp} / {xpForNext} XP
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: palette.border }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: palette.primary,
              width: progress.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  levelText: { color: "#FFF", fontSize: 12, fontWeight: "700" },
  xpText: { fontSize: 12, fontWeight: "600" },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 4,
  },
});
