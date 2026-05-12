import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Colors } from "../../../src/theme";
import { useSettingsStore } from "../../../src/stores/settingsStore";
import { useChildStore } from "../../../src/stores/childStore";

const QUIZZES: Record<string, {
  title: string;
  emoji: string;
  xp: number;
  questions: Array<{
    q: string;
    options: string[];
    correct: number;
    emoji: string;
  }>;
}> = {
  q1: {
    title: "Animal Kingdom",
    emoji: "🦁",
    xp: 50,
    questions: [
      { q: "Which animal is known as the King of the Jungle?", options: ["Tiger", "Lion", "Elephant", "Bear"], correct: 1, emoji: "🦁" },
      { q: "How many legs does a spider have?", options: ["6", "8", "4", "10"], correct: 1, emoji: "🕷️" },
      { q: "Which bird can fly backwards?", options: ["Sparrow", "Eagle", "Hummingbird", "Parrot"], correct: 2, emoji: "🐦" },
      { q: "What is the fastest land animal?", options: ["Lion", "Horse", "Cheetah", "Deer"], correct: 2, emoji: "🐆" },
      { q: "Which animal sleeps standing up?", options: ["Cat", "Horse", "Dog", "Cow"], correct: 1, emoji: "🐎" },
    ],
  },
  q2: {
    title: "Indian Festivals",
    emoji: "🎆",
    xp: 50,
    questions: [
      { q: "Which festival is called the Festival of Lights?", options: ["Holi", "Diwali", "Eid", "Christmas"], correct: 1, emoji: "🪔" },
      { q: "On which festival do we play with colors?", options: ["Diwali", "Navratri", "Holi", "Pongal"], correct: 2, emoji: "🎨" },
      { q: "What do we fly on Makar Sankranti?", options: ["Balloons", "Kites", "Drones", "Flags"], correct: 1, emoji: "🪁" },
      { q: "Which festival celebrates Lord Ganesh?", options: ["Navratri", "Ganesh Chaturthi", "Onam", "Lohri"], correct: 1, emoji: "🐘" },
      { q: "Baisakhi is celebrated in which state?", options: ["Rajasthan", "Kerala", "Punjab", "Gujarat"], correct: 2, emoji: "🌾" },
    ],
  },
};

const DEFAULT_QUIZ = QUIZZES.q1;

export default function QuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const quiz = QUIZZES[id] ?? DEFAULT_QUIZ;

  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);

  const isDark = useSettingsStore((s) => s.isDarkMode);
  const addXP = useChildStore((s) => s.addXP);
  const palette = isDark ? Colors.dark : Colors.light;
  const anim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const q = quiz.questions[currentQ];
  const isLast = currentQ === quiz.questions.length - 1;

  useEffect(() => {
    startTimer();
    return () => stopTimer();
  }, [currentQ]);

  function startTimer() {
    setTimeLeft(20);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          stopTimer();
          handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  function stopTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function handleTimeout() {
    if (selected === null) {
      setSelected(-1);
      setTimeout(() => nextQuestion(), 1500);
    }
  }

  function handleSelect(idx: number) {
    if (selected !== null) return;
    stopTimer();
    setSelected(idx);
    if (idx === q.correct) {
      setScore((s) => s + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setTimeout(() => nextQuestion(), 1500);
  }

  function nextQuestion() {
    if (isLast) {
      const xpEarned = Math.round((score / quiz.questions.length) * quiz.xp);
      addXP(xpEarned);
      setFinished(true);
    } else {
      Animated.sequence([
        Animated.timing(anim, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
      setCurrentQ((c) => c + 1);
      setSelected(null);
    }
  }

  const timerColor = timeLeft > 10 ? "#059669" : timeLeft > 5 ? "#F97316" : "#DC2626";
  const pct = (currentQ / quiz.questions.length) * 100;

  if (finished) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    const xpEarned = Math.round((score / quiz.questions.length) * quiz.xp);
    return (
      <View style={[styles.container, { backgroundColor: palette.background }]}>
        <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 24 }}>
          <Text style={{ fontSize: 80 }}>
            {percentage >= 80 ? "🏆" : percentage >= 50 ? "🌟" : "💪"}
          </Text>
          <Text style={[styles.resultTitle, { color: palette.text }]}>
            {percentage >= 80 ? "Excellent!" : percentage >= 50 ? "Good Job!" : "Keep Trying!"}
          </Text>
          <Text style={[styles.resultHindi, { color: palette.textMuted }]}>
            {percentage >= 80 ? "शाबाश!" : percentage >= 50 ? "बढ़िया!" : "और कोशिश करो!"}
          </Text>
          <View style={[styles.scoreCard, { backgroundColor: palette.card }]}>
            <Text style={[styles.scoreText, { color: palette.text }]}>
              {score} / {quiz.questions.length}
            </Text>
            <Text style={[styles.scoreLabel, { color: palette.textMuted }]}>Questions Correct</Text>
            <View style={[styles.xpBadge, { backgroundColor: Colors.activity.quiz.bg }]}>
              <Text style={{ color: Colors.activity.quiz.icon, fontWeight: "700", fontSize: 18 }}>
                +{xpEarned} XP earned!
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: palette.primary }]}
            onPress={() => router.back()}
          >
            <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 16 }}>
              Back to Home 🏠
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            setCurrentQ(0); setScore(0); setSelected(null); setFinished(false);
          }}>
            <Text style={{ color: palette.primary, fontWeight: "600" }}>Play Again</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ fontSize: 24 }}>✕</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.quizTitle, { color: palette.text }]}>
              {quiz.emoji} {quiz.title}
            </Text>
            <Text style={[styles.questionNum, { color: palette.textMuted }]}>
              {currentQ + 1} of {quiz.questions.length}
            </Text>
          </View>
          <View style={[styles.timerBadge, { backgroundColor: timerColor + "20" }]}>
            <Text style={[styles.timerText, { color: timerColor }]}>{timeLeft}s</Text>
          </View>
        </View>

        {/* Progress */}
        <View style={[styles.progressTrack, { backgroundColor: palette.border }]}>
          <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: palette.primary }]} />
        </View>

        {/* Question */}
        <Animated.View style={[styles.questionCard, { opacity: anim }]}>
          <View style={[styles.qCard, { backgroundColor: palette.card }]}>
            <Text style={styles.qEmoji}>{q.emoji}</Text>
            <Text style={[styles.qText, { color: palette.text }]}>{q.q}</Text>
          </View>

          {/* Options */}
          <View style={styles.options}>
            {q.options.map((opt, i) => {
              let bg = palette.card;
              let textColor = palette.text;
              let borderColor = palette.border;

              if (selected !== null) {
                if (i === q.correct) {
                  bg = "#ECFDF5"; textColor = "#065F46"; borderColor = "#059669";
                } else if (i === selected && selected !== q.correct) {
                  bg = "#FEF2F2"; textColor = "#991B1B"; borderColor = "#DC2626";
                }
              }

              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => handleSelect(i)}
                  style={[styles.optionBtn, { backgroundColor: bg, borderColor }]}
                  activeOpacity={selected !== null ? 1 : 0.8}
                >
                  <View style={[styles.optionIndex, { backgroundColor: palette.cardSecondary ?? palette.border }]}>
                    <Text style={[styles.optionIndexText, { color: palette.textMuted }]}>
                      {["A", "B", "C", "D"][i]}
                    </Text>
                  </View>
                  <Text style={[styles.optionText, { color: textColor }]}>{opt}</Text>
                  {selected !== null && i === q.correct && (
                    <Text style={{ fontSize: 18 }}>✅</Text>
                  )}
                  {selected !== null && i === selected && selected !== q.correct && (
                    <Text style={{ fontSize: 18 }}>❌</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
  },
  headerCenter: { alignItems: "center" },
  quizTitle: { fontSize: 15, fontWeight: "700" },
  questionNum: { fontSize: 12 },
  timerBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  timerText: { fontSize: 15, fontWeight: "800" },
  progressTrack: { height: 6, marginHorizontal: 20, borderRadius: 3 },
  progressFill: { height: 6, borderRadius: 3 },
  questionCard: { flex: 1, paddingHorizontal: 20, paddingTop: 20, gap: 16 },
  qCard: {
    borderRadius: 24, padding: 24, alignItems: "center", gap: 16,
    shadowColor: "#7C5CBF", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
  },
  qEmoji: { fontSize: 56 },
  qText: { fontSize: 18, fontWeight: "700", textAlign: "center", lineHeight: 26 },
  options: { gap: 12 },
  optionBtn: {
    flexDirection: "row", alignItems: "center", gap: 14,
    padding: 16, borderRadius: 16, borderWidth: 2,
  },
  optionIndex: {
    width: 32, height: 32, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  optionIndexText: { fontSize: 13, fontWeight: "700" },
  optionText: { flex: 1, fontSize: 15, fontWeight: "600" },
  resultTitle: { fontSize: 32, fontWeight: "800", textAlign: "center" },
  resultHindi: { fontSize: 20, textAlign: "center" },
  scoreCard: {
    width: "100%", borderRadius: 24, padding: 28, alignItems: "center", gap: 8,
  },
  scoreText: { fontSize: 48, fontWeight: "800" },
  scoreLabel: { fontSize: 16 },
  xpBadge: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 16, marginTop: 8 },
  doneBtn: { width: "100%", padding: 18, borderRadius: 18, alignItems: "center" },
});
