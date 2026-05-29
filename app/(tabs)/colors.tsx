import React, { useState, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  Dimensions, Animated, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAgeTheme } from "../../src/hooks/useAgeTheme";
import { useChildStore } from "../../src/stores/childStore";

const { width } = Dimensions.get("window");
const CARD = (width - 64) / 2;

const COLORS = [
  { name: "Red",    hindi: "लाल",   hex: "#EF4444", emoji: "🍎" },
  { name: "Blue",   hindi: "नीला",  hex: "#3B82F6", emoji: "🫐" },
  { name: "Yellow", hindi: "पीला",  hex: "#EAB308", emoji: "🌻" },
  { name: "Green",  hindi: "हरा",   hex: "#22C55E", emoji: "🍃" },
  { name: "Orange", hindi: "नारंगी",hex: "#F97316", emoji: "🍊" },
  { name: "Pink",   hindi: "गुलाबी",hex: "#EC4899", emoji: "🌸" },
  { name: "Purple", hindi: "बैंगनी",hex: "#A855F7", emoji: "🍇" },
  { name: "White",  hindi: "सफेद",  hex: "#E5E7EB", emoji: "☁️" },
];

export default function ColorsScreen() {
  const { theme } = useAgeTheme();
  const activeChild = useChildStore((s) => s.activeChild);
  const lang = activeChild?.preferred_language ?? "both";
  const [active, setActive] = useState<string | null>(null);

  function getLabel(color: typeof COLORS[0]) {
    if (lang === "hindi")   return color.hindi;
    if (lang === "english") return color.name;
    return `${color.name} / ${color.hindi}`;
  }
  const pulseAnims = useRef(
    COLORS.reduce((acc, c) => {
      acc[c.name] = new Animated.Value(1);
      return acc;
    }, {} as Record<string, Animated.Value>)
  ).current;

  function handleTap(color: typeof COLORS[0]) {
    setActive(color.name);
    Animated.sequence([
      Animated.spring(pulseAnims[color.name], { toValue: 1.12, useNativeDriver: true, bounciness: 20 }),
      Animated.spring(pulseAnims[color.name], { toValue: 1,    useNativeDriver: true }),
    ]).start();
    setTimeout(() => setActive(null), 1000);
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView style={{ flex: 1 }}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>🌈</Text>
          <View>
            <Text style={[styles.title, { color: theme.colors.primary }]}>Colors</Text>
            <Text style={[styles.sub, { color: theme.colors.textMuted }]}>Tap to learn!</Text>
          </View>
        </View>

        {/* Active color big display */}
        {active && (() => {
          const c = COLORS.find(x => x.name === active)!;
          return (
            <View style={[styles.activeBanner, { backgroundColor: c.hex }]}>
              <Text style={styles.activeEmoji}>{c.emoji}</Text>
              <Text style={styles.activeName}>{getLabel(c)}</Text>
            </View>
          );
        })()}

        <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
          {COLORS.map((color) => (
            <TouchableOpacity key={color.name} onPress={() => handleTap(color)} activeOpacity={0.85}>
              <Animated.View style={[
                styles.card,
                { transform: [{ scale: pulseAnims[color.name] }] },
              ]}>
                {/* Color circle */}
                <View style={[styles.circle, { backgroundColor: color.hex }]}>
                  <Text style={styles.circleEmoji}>{color.emoji}</Text>
                </View>
                <Text style={[styles.colorName, { color: theme.colors.text }]}>{getLabel(color)}</Text>

                {/* Color swatch bar */}
                <View style={[styles.swatch, { backgroundColor: color.hex + "30", borderColor: color.hex }]}>
                  <View style={[styles.swatchFill, { backgroundColor: color.hex }]} />
                </View>
              </Animated.View>
            </TouchableOpacity>
          ))}
        </ScrollView>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8,
  },
  headerEmoji: { fontSize: 44 },
  title: { fontSize: 26, fontWeight: "900" },
  sub:   { fontSize: 13, fontWeight: "600" },

  activeBanner: {
    marginHorizontal: 24, borderRadius: 20,
    paddingVertical: 16, alignItems: "center", gap: 4,
    marginBottom: 8,
  },
  activeEmoji: { fontSize: 40 },
  activeName:  { fontSize: 24, fontWeight: "900", color: "#FFF" },
  activeHindi: { fontSize: 16, color: "rgba(255,255,255,0.9)", fontWeight: "700" },

  grid: {
    flexDirection: "row", flexWrap: "wrap",
    gap: 12, padding: 24, paddingTop: 8,
  },
  card: {
    width: CARD, backgroundColor: "#FFF", borderRadius: 20,
    padding: 16, alignItems: "center", gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  circle: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: "center", justifyContent: "center",
  },
  circleEmoji: { fontSize: 36 },
  colorName:   { fontSize: 16, fontWeight: "800" },
  colorHindi:  { fontSize: 12, fontWeight: "600" },
  swatch: {
    width: "100%", height: 10, borderRadius: 5,
    borderWidth: 1, overflow: "hidden",
  },
  swatchFill: { width: "60%", height: "100%" },
});
