import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Easing,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../src/theme";
import { useSettingsStore } from "../../src/stores/settingsStore";
import { useChildStore } from "../../src/stores/childStore";

type Phase = "idle" | "inhale" | "hold" | "exhale" | "done";

const SESSIONS = [
  {
    id: "s1",
    title: "Breathing Bubbles",
    titleHindi: "सांस के बुलबुले",
    emoji: "🫧",
    cycles: 4,
    inhale: 4,
    hold: 2,
    exhale: 4,
    xp: 25,
  },
  {
    id: "s2",
    title: "Rainbow Breath",
    titleHindi: "इंद्रधनुष सांस",
    emoji: "🌈",
    cycles: 3,
    inhale: 5,
    hold: 3,
    exhale: 5,
    xp: 30,
  },
];

const PHASE_TEXT: Record<Phase, { en: string; hi: string; color: string }> = {
  idle: { en: "Press Start", hi: "शुरू करो", color: "#7C5CBF" },
  inhale: { en: "Breathe In...", hi: "सांस लो...", color: "#0EA5E9" },
  hold: { en: "Hold...", hi: "रोको...", color: "#F97316" },
  exhale: { en: "Breathe Out...", hi: "सांस छोड़ो...", color: "#059669" },
  done: { en: "Well done!", hi: "शाबाश!", color: "#7C5CBF" },
};

export default function MeditationScreen() {
  const isDark = useSettingsStore((s) => s.isDarkMode);
  const addXP = useChildStore((s) => s.addXP);
  const palette = isDark ? Colors.dark : Colors.light;

  const session = SESSIONS[0];
  const [phase, setPhase] = useState<Phase>("idle");
  const [cycle, setCycle] = useState(0);
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (phase === "inhale") {
      Animated.timing(scaleAnim, {
        toValue: 1.5, duration: session.inhale * 1000, useNativeDriver: true,
      }).start();
    } else if (phase === "exhale") {
      Animated.timing(scaleAnim, {
        toValue: 1, duration: session.exhale * 1000, useNativeDriver: true,
      }).start();
    }
  }, [phase]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.4, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  function startSession() {
    setRunning(true);
    runPhase("inhale", session.inhale);
  }

  function runPhase(p: Phase, duration: number) {
    setPhase(p);
    setTimer(duration);

    let count = duration;
    timerRef.current = setInterval(() => {
      count -= 1;
      setTimer(count);
      if (count <= 0) {
        clearInterval(timerRef.current!);
        nextPhase(p);
      }
    }, 1000);
  }

  function nextPhase(current: Phase) {
    if (current === "inhale") {
      runPhase("hold", session.hold);
    } else if (current === "hold") {
      runPhase("exhale", session.exhale);
    } else if (current === "exhale") {
      const nextCycle = cycle + 1;
      setCycle(nextCycle);
      if (nextCycle >= session.cycles) {
        setPhase("done");
        setRunning(false);
        addXP(session.xp);
      } else {
        runPhase("inhale", session.inhale);
      }
    }
  }

  function stopSession() {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("idle");
    setRunning(false);
    setCycle(0);
    scaleAnim.setValue(1);
  }

  const phaseInfo = PHASE_TEXT[phase];
  const progressPct = session.cycles > 0 ? (cycle / session.cycles) * 100 : 0;

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { stopSession(); router.back(); }}>
            <Text style={{ fontSize: 24, color: palette.text }}>✕</Text>
          </TouchableOpacity>
          <View style={{ alignItems: "center" }}>
            <Text style={[styles.title, { color: palette.text }]}>
              {session.emoji} {session.title}
            </Text>
            <Text style={[styles.titleHindi, { color: palette.textMuted }]}>
              {session.titleHindi}
            </Text>
          </View>
          <View style={styles.cycleBadge}>
            <Text style={[styles.cycleText, { color: palette.textMuted }]}>
              {cycle}/{session.cycles}
            </Text>
          </View>
        </View>

        {/* Progress */}
        <View style={[styles.progressTrack, { backgroundColor: palette.border }]}>
          <View style={[styles.progressFill, { width: `${progressPct}%`, backgroundColor: Colors.activity.meditation.icon }]} />
        </View>

        {/* Main breathing circle */}
        <View style={styles.circleArea}>
          <Animated.View style={{ opacity: glowAnim }}>
            <View style={[styles.glowRing, { borderColor: phaseInfo.color + "30" }]} />
          </Animated.View>
          <Animated.View
            style={[
              styles.breathCircle,
              {
                backgroundColor: phaseInfo.color + "20",
                borderColor: phaseInfo.color,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Text style={styles.circleEmoji}>{session.emoji}</Text>
          </Animated.View>
        </View>

        {/* Phase label */}
        <View style={styles.phaseArea}>
          <Text style={[styles.phaseEn, { color: phaseInfo.color }]}>{phaseInfo.en}</Text>
          <Text style={[styles.phaseHi, { color: palette.textMuted }]}>{phaseInfo.hi}</Text>
          {running && phase !== "done" && (
            <Text style={[styles.timerNum, { color: phaseInfo.color }]}>{timer}</Text>
          )}
        </View>

        {/* Done state */}
        {phase === "done" && (
          <View style={[styles.doneCard, { backgroundColor: Colors.activity.meditation.bg }]}>
            <Text style={styles.doneText}>+{session.xp} XP earned! 🧘</Text>
            <TouchableOpacity
              style={[styles.doneBtn, { backgroundColor: Colors.activity.meditation.icon }]}
              onPress={() => router.back()}
            >
              <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 15 }}>
                Back to Home 🏠
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Controls */}
        {phase !== "done" && (
          <View style={styles.controls}>
            {!running ? (
              <TouchableOpacity
                style={[styles.startBtn, { backgroundColor: Colors.activity.meditation.icon }]}
                onPress={startSession}
              >
                <Text style={styles.startText}>▶ Start Breathing</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.stopBtn, { backgroundColor: "#FEE2E2" }]}
                onPress={stopSession}
              >
                <Text style={{ color: "#DC2626", fontWeight: "700", fontSize: 15 }}>⏹ Stop</Text>
              </TouchableOpacity>
            )}

            <Text style={[styles.tip, { color: palette.textMuted }]}>
              💡 Sit comfortably, close your eyes, and follow the circle.
            </Text>
          </View>
        )}
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
  title: { fontSize: 16, fontWeight: "700" },
  titleHindi: { fontSize: 12 },
  cycleBadge: {},
  cycleText: { fontSize: 14, fontWeight: "600" },
  progressTrack: { height: 6, marginHorizontal: 20, borderRadius: 3 },
  progressFill: { height: 6, borderRadius: 3 },
  circleArea: {
    flex: 1, alignItems: "center", justifyContent: "center",
    position: "relative",
  },
  glowRing: {
    position: "absolute", width: 260, height: 260, borderRadius: 130,
    borderWidth: 40,
  },
  breathCircle: {
    width: 180, height: 180, borderRadius: 90, borderWidth: 3,
    alignItems: "center", justifyContent: "center",
  },
  circleEmoji: { fontSize: 60 },
  phaseArea: { alignItems: "center", gap: 6, paddingBottom: 24 },
  phaseEn: { fontSize: 26, fontWeight: "800" },
  phaseHi: { fontSize: 16 },
  timerNum: { fontSize: 48, fontWeight: "800", marginTop: 8 },
  doneCard: {
    marginHorizontal: 24, borderRadius: 20, padding: 20, gap: 14, alignItems: "center",
  },
  doneText: { fontSize: 18, fontWeight: "700", color: "#0C4A6E" },
  doneBtn: { width: "100%", padding: 16, borderRadius: 16, alignItems: "center" },
  controls: { paddingHorizontal: 24, paddingBottom: 24, gap: 16 },
  startBtn: { padding: 18, borderRadius: 18, alignItems: "center" },
  startText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
  stopBtn: { padding: 18, borderRadius: 18, alignItems: "center" },
  tip: { fontSize: 13, textAlign: "center", lineHeight: 20 },
});
