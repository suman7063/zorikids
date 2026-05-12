import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Colors } from "../../../src/theme";
import { useSettingsStore } from "../../../src/stores/settingsStore";
import { useChildStore } from "../../../src/stores/childStore";

function generateProblems(level: "add" | "sub" | "mix", count: number) {
  return Array.from({ length: count }, (_, i) => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    const op = level === "add" ? "+" : level === "sub" ? "-" : i % 2 === 0 ? "+" : "-";
    const answer = op === "+" ? a + b : Math.abs(a - b);
    const displayA = op === "-" ? Math.max(a, b) : a;
    const displayB = op === "-" ? Math.min(a, b) : b;

    const wrong1 = answer + Math.floor(Math.random() * 3) + 1;
    const wrong2 = Math.max(0, answer - Math.floor(Math.random() * 3) - 1);
    const wrong3 = answer + Math.floor(Math.random() * 5) + 2;
    const opts = [answer, wrong1, wrong2, wrong3].sort(() => Math.random() - 0.5);

    return { a: displayA, b: displayB, op, answer, options: opts };
  });
}

const EMOJIS_FOR_COUNTING = ["🍎", "🌟", "🐟", "🦋", "🍦", "🎈", "🐶", "🌸"];

export default function MathScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const levelMap: Record<string, "add" | "sub" | "mix"> = {
    m1: "add", m2: "sub", m3: "mix",
  };
  const level = levelMap[id] ?? "add";

  const [problems] = useState(() => generateProblems(level, 8));
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const isDark = useSettingsStore((s) => s.isDarkMode);
  const addXP = useChildStore((s) => s.addXP);
  const palette = isDark ? Colors.dark : Colors.light;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  const prob = problems[current];
  const emojiSet = EMOJIS_FOR_COUNTING[current % EMOJIS_FOR_COUNTING.length];
  const isLast = current === problems.length - 1;

  function handleSelect(opt: number) {
    if (selected !== null) return;
    setSelected(opt);
    if (opt === prob.answer) {
      setScore((s) => s + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 1.15, duration: 100, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setTimeout(() => {
      if (isLast) {
        const xpEarned = Math.round((score / problems.length) * 40);
        addXP(xpEarned);
        setFinished(true);
      } else {
        setCurrent((c) => c + 1);
        setSelected(null);
      }
    }, 1200);
  }

  const pct = ((current) / problems.length) * 100;

  if (finished) {
    const pct2 = Math.round((score / problems.length) * 100);
    return (
      <View style={[styles.container, { backgroundColor: palette.background }]}>
        <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 24 }}>
          <Text style={{ fontSize: 80 }}>{pct2 >= 70 ? "🧮" : "💡"}</Text>
          <Text style={[styles.finTitle, { color: palette.text }]}>
            {pct2 >= 70 ? "Math Wizard!" : "Good Try!"}
          </Text>
          <Text style={{ fontSize: 18, color: palette.textMuted }}>
            {pct2 >= 70 ? "गणित जादूगर!" : "और प्रयास करो!"}
          </Text>
          <View style={[styles.scoreCard, { backgroundColor: palette.card }]}>
            <Text style={[styles.scoreNum, { color: Colors.activity.math.icon }]}>
              {score}/{problems.length}
            </Text>
            <Text style={{ color: palette.textMuted }}>Correct Answers</Text>
          </View>
          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: Colors.activity.math.icon }]}
            onPress={() => router.back()}
          >
            <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 16 }}>Back to Home 🏠</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ fontSize: 24, color: palette.text }}>✕</Text>
          </TouchableOpacity>
          <Text style={[styles.titleText, { color: palette.text }]}>
            🔢 Math Magic
          </Text>
          <Text style={[styles.progress, { color: palette.textMuted }]}>
            {current + 1}/{problems.length}
          </Text>
        </View>

        <View style={[styles.progressTrack, { backgroundColor: palette.border }]}>
          <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: Colors.activity.math.icon }]} />
        </View>

        {/* Visual counting */}
        <View style={[styles.visualCard, { backgroundColor: Colors.activity.math.bg }]}>
          <View style={styles.emojiRow}>
            {Array.from({ length: prob.a }).map((_, i) => (
              <Text key={i} style={styles.countEmoji}>{emojiSet}</Text>
            ))}
          </View>
          <Text style={[styles.opText, { color: Colors.activity.math.text }]}>
            {prob.op === "+" ? "➕" : "➖"}
          </Text>
          <View style={styles.emojiRow}>
            {Array.from({ length: prob.b }).map((_, i) => (
              <Text key={i} style={styles.countEmoji}>{emojiSet}</Text>
            ))}
          </View>
        </View>

        {/* Equation */}
        <Animated.View style={[styles.eqCard, { backgroundColor: palette.card, transform: [{ scale: bounceAnim }] }]}>
          <Text style={[styles.equation, { color: palette.text }]}>
            {prob.a} {prob.op} {prob.b} = ?
          </Text>
        </Animated.View>

        {/* Options */}
        <View style={styles.options}>
          {prob.options.map((opt, i) => {
            let bg = palette.card;
            let textColor = palette.text;
            let border = palette.border;
            if (selected !== null) {
              if (opt === prob.answer) { bg = "#ECFDF5"; textColor = "#065F46"; border = "#059669"; }
              else if (opt === selected) { bg = "#FEF2F2"; textColor = "#991B1B"; border = "#DC2626"; }
            }
            return (
              <TouchableOpacity
                key={i}
                onPress={() => handleSelect(opt)}
                style={[styles.optBtn, { backgroundColor: bg, borderColor: border }]}
                activeOpacity={selected !== null ? 1 : 0.8}
              >
                <Text style={[styles.optText, { color: textColor }]}>{opt}</Text>
                {selected !== null && opt === prob.answer && <Text style={{ fontSize: 20 }}>✅</Text>}
                {selected !== null && opt === selected && opt !== prob.answer && <Text style={{ fontSize: 20 }}>❌</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8,
  },
  titleText: { fontSize: 17, fontWeight: "700" },
  progress: { fontSize: 13 },
  progressTrack: { height: 6, marginHorizontal: 20, borderRadius: 3 },
  progressFill: { height: 6, borderRadius: 3 },
  visualCard: {
    margin: 20, borderRadius: 24, padding: 20, alignItems: "center", gap: 12,
  },
  emojiRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 4 },
  countEmoji: { fontSize: 24 },
  opText: { fontSize: 32, fontWeight: "800" },
  eqCard: {
    marginHorizontal: 20, borderRadius: 24, padding: 24, alignItems: "center",
    shadowColor: "#059669", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
  },
  equation: { fontSize: 40, fontWeight: "800" },
  options: {
    paddingHorizontal: 20, paddingTop: 16, flexDirection: "row",
    flexWrap: "wrap", gap: 12, justifyContent: "center",
  },
  optBtn: {
    width: "45%", padding: 20, borderRadius: 20, borderWidth: 2,
    alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8,
  },
  optText: { fontSize: 28, fontWeight: "800" },
  finTitle: { fontSize: 32, fontWeight: "800" },
  scoreCard: { borderRadius: 20, padding: 24, alignItems: "center", gap: 4, width: "100%" },
  scoreNum: { fontSize: 48, fontWeight: "800" },
  doneBtn: { width: "100%", padding: 18, borderRadius: 18, alignItems: "center" },
});
