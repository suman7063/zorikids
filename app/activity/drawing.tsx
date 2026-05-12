import React, { useState, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, PanResponder,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Colors } from "../../src/theme";
import { useSettingsStore } from "../../src/stores/settingsStore";
import { useChildStore } from "../../src/stores/childStore";

const { width } = Dimensions.get("window");
const CANVAS_HEIGHT = width * 1.1;

const COLORS_PALETTE = [
  "#1E1B4B", "#7C5CBF", "#F97316", "#059669",
  "#EC4899", "#0EA5E9", "#DC2626", "#D97706",
  "#FFFFFF", "#6B7280",
];
const BRUSH_SIZES = [4, 8, 14, 22];

export default function DrawingScreen() {
  const isDark = useSettingsStore((s) => s.isDarkMode);
  const addXP = useChildStore((s) => s.addXP);
  const palette = isDark ? Colors.dark : Colors.light;

  const [paths, setPaths] = useState<Array<{ d: string; color: string; width: number }>>([]);
  const [currentColor, setCurrentColor] = useState("#1E1B4B");
  const [brushSize, setBrushSize] = useState(8);
  const [isEraser, setIsEraser] = useState(false);
  const currentPath = useRef<string>("");
  const [saved, setSaved] = useState(false);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      currentPath.current = `M ${locationX} ${locationY}`;
    },
    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      currentPath.current += ` L ${locationX} ${locationY}`;
      setPaths((prev) => {
        const copy = [...prev];
        if (copy.length > 0 && copy[copy.length - 1].d === currentPath.current.split(" L")[0]) {
          copy[copy.length - 1].d = currentPath.current;
          return copy;
        }
        return [
          ...prev,
          {
            d: currentPath.current,
            color: isEraser ? (isDark ? palette.card : "#FFF") : currentColor,
            width: isEraser ? 28 : brushSize,
          },
        ];
      });
    },
    onPanResponderRelease: () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
  });

  function handleSave() {
    addXP(20);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ fontSize: 24, color: palette.text }}>✕</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: palette.text }]}>🎨 Art Studio</Text>
          <TouchableOpacity
            onPress={() => setPaths([])}
            style={[styles.clearBtn, { backgroundColor: "#FEE2E2" }]}
          >
            <Text style={{ color: "#DC2626", fontWeight: "600", fontSize: 13 }}>Clear</Text>
          </TouchableOpacity>
        </View>

        {/* Canvas */}
        <View
          style={[styles.canvas, { backgroundColor: isDark ? "#1A1A2E" : "#FFF" }]}
          {...panResponder.panHandlers}
        >
          {paths.map((_, i) => (
            <View
              key={i}
              style={[
                StyleSheet.absoluteFill,
                { pointerEvents: "none" } as any,
              ]}
            />
          ))}
          {/* Simple SVG-like drawing using views - placeholder for actual canvas */}
          <View style={styles.canvasPlaceholder}>
            <Text style={[styles.drawHint, { color: palette.textLight }]}>
              ✏️ Draw here!
            </Text>
            <Text style={[styles.drawSub, { color: palette.textLight }]}>
              आर्ट बनाओ!
            </Text>
          </View>
        </View>

        {saved && (
          <View style={styles.savedBanner}>
            <Text style={styles.savedText}>✅ Drawing saved! +20 XP</Text>
          </View>
        )}

        {/* Color palette */}
        <View style={styles.toolbar}>
          <View style={styles.colorRow}>
            {COLORS_PALETTE.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => { setCurrentColor(c); setIsEraser(false); }}
                style={[
                  styles.colorDot,
                  { backgroundColor: c },
                  currentColor === c && !isEraser && styles.colorSelected,
                ]}
              />
            ))}
          </View>

          <View style={styles.toolRow}>
            <View style={styles.brushSizes}>
              {BRUSH_SIZES.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setBrushSize(s)}
                  style={[
                    styles.brushBtn,
                    { backgroundColor: brushSize === s ? currentColor : palette.border },
                  ]}
                >
                  <View
                    style={[
                      styles.brushDot,
                      { width: s * 0.7, height: s * 0.7, backgroundColor: brushSize === s ? "#FFF" : currentColor },
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => setIsEraser((e) => !e)}
              style={[
                styles.eraserBtn,
                { backgroundColor: isEraser ? "#FEF3C7" : palette.card },
              ]}
            >
              <Text style={{ fontSize: 20 }}>🧹</Text>
              <Text style={{ fontSize: 11, fontWeight: "600", color: palette.textMuted }}>
                Erase
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              style={[styles.saveBtn, { backgroundColor: Colors.light.primary }]}
            >
              <Text style={{ fontSize: 20 }}>💾</Text>
              <Text style={{ fontSize: 11, fontWeight: "700", color: "#FFF" }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 12,
  },
  title: { fontSize: 17, fontWeight: "700" },
  clearBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
  canvas: {
    marginHorizontal: 16, borderRadius: 20, height: CANVAS_HEIGHT,
    overflow: "hidden", justifyContent: "center", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  canvasPlaceholder: { alignItems: "center", gap: 8, opacity: 0.3 },
  drawHint: { fontSize: 32 },
  drawSub: { fontSize: 16, fontWeight: "500" },
  savedBanner: {
    backgroundColor: "#ECFDF5", marginHorizontal: 16, marginTop: 8,
    padding: 12, borderRadius: 12, alignItems: "center",
  },
  savedText: { color: "#059669", fontWeight: "700", fontSize: 14 },
  toolbar: { padding: 16, gap: 12 },
  colorRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "center" },
  colorDot: { width: 30, height: 30, borderRadius: 15 },
  colorSelected: { borderWidth: 3, borderColor: "#1E1B4B" },
  toolRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  brushSizes: { flexDirection: "row", gap: 8, flex: 1 },
  brushBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
  },
  brushDot: { borderRadius: 99 },
  eraserBtn: {
    padding: 10, borderRadius: 14, alignItems: "center", gap: 2, minWidth: 52,
  },
  saveBtn: {
    padding: 10, borderRadius: 14, alignItems: "center", gap: 2, minWidth: 52,
  },
});
