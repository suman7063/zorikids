import React from "react";
import {
  View, Text, ScrollView, StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useChildStore } from "../../src/stores/childStore";
import { useSettingsStore } from "../../src/stores/settingsStore";
import { StreakBadge } from "../../src/components/ui/StreakBadge";
import { XPBar } from "../../src/components/ui/XPBar";
import { Colors } from "../../src/theme";

const ALL_BADGES = [
  { id: "b1", emoji: "🌟", name: "First Star", nameHindi: "पहला सितारा", desc: "Complete your first activity", earned: true, color: "#F59E0B" },
  { id: "b2", emoji: "🔥", name: "Hot Streak", nameHindi: "लगातार 3 दिन", desc: "Learn 3 days in a row", earned: true, color: "#F97316" },
  { id: "b3", emoji: "🧠", name: "Quiz Master", nameHindi: "क्विज़ मास्टर", desc: "Complete 5 quizzes", earned: false, color: "#7C5CBF" },
  { id: "b4", emoji: "📖", name: "Story Lover", nameHindi: "कहानी प्रेमी", desc: "Read 3 stories", earned: false, color: "#0EA5E9" },
  { id: "b5", emoji: "🔢", name: "Math Wizard", nameHindi: "गणित जादूगर", desc: "Complete 5 math games", earned: false, color: "#059669" },
  { id: "b6", emoji: "🎨", name: "Little Artist", nameHindi: "छोटा कलाकार", desc: "Draw 3 pictures", earned: false, color: "#EC4899" },
  { id: "b7", emoji: "🧘", name: "Zen Kid", nameHindi: "शांत बच्चा", desc: "Complete 3 meditations", earned: false, color: "#6366F1" },
  { id: "b8", emoji: "🏆", name: "Champion", nameHindi: "चैंपियन", desc: "Earn 500 XP total", earned: false, color: "#D97706" },
  { id: "b9", emoji: "🚀", name: "Rocket Learner", nameHindi: "रॉकेट लर्नर", desc: "7-day streak", earned: false, color: "#8B5CF6" },
  { id: "b10", emoji: "💎", name: "Diamond Kid", nameHindi: "हीरा बच्चा", desc: "Earn 1000 XP", earned: false, color: "#0EA5E9" },
];

const WEEKLY_DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export default function RewardsScreen() {
  const streak = useChildStore((s) => s.streak);
  const totalXP = useChildStore((s) => s.totalXP);
  const isDark = useSettingsStore((s) => s.isDarkMode);
  const palette = isDark ? Colors.dark : Colors.light;

  const level = Math.floor(totalXP / 200) + 1;
  const xpInLevel = totalXP % 200;
  const earned = ALL_BADGES.filter((b) => b.earned);
  const locked = ALL_BADGES.filter((b) => !b.earned);

  const todayIndex = new Date().getDay();
  const activeDay = todayIndex === 0 ? 6 : todayIndex - 1;

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: palette.text }]}>Rewards 🏆</Text>
            <Text style={[styles.sub, { color: palette.textMuted }]}>पुरस्कार और उपलब्धियाँ</Text>
          </View>

          {/* Streak + XP cards */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: palette.card, flex: 1 }]}>
              <Text style={styles.statEmoji}>🔥</Text>
              <Text style={[styles.statValue, { color: "#F97316" }]}>
                {streak?.current_streak ?? 0}
              </Text>
              <Text style={[styles.statLabel, { color: palette.textMuted }]}>Day Streak</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: palette.card, flex: 1 }]}>
              <Text style={styles.statEmoji}>⭐</Text>
              <Text style={[styles.statValue, { color: palette.primary }]}>{totalXP}</Text>
              <Text style={[styles.statLabel, { color: palette.textMuted }]}>Total XP</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: palette.card, flex: 1 }]}>
              <Text style={styles.statEmoji}>🏅</Text>
              <Text style={[styles.statValue, { color: "#D97706" }]}>{earned.length}</Text>
              <Text style={[styles.statLabel, { color: palette.textMuted }]}>Badges</Text>
            </View>
          </View>

          {/* Level progress */}
          <View style={[styles.levelCard, { backgroundColor: palette.card }]}>
            <View style={styles.levelHeader}>
              <Text style={[styles.levelTitle, { color: palette.text }]}>Level {level} Progress</Text>
              <Text style={[styles.levelSub, { color: palette.textMuted }]}>{xpInLevel}/200 XP</Text>
            </View>
            <XPBar xp={xpInLevel} level={level} xpForNext={200} />
          </View>

          {/* Weekly streak calendar */}
          <View style={[styles.calendarCard, { backgroundColor: palette.card }]}>
            <Text style={[styles.calTitle, { color: palette.text }]}>This Week's Learning</Text>
            <View style={styles.weekRow}>
              {WEEKLY_DAYS.map((day, i) => (
                <View key={i} style={styles.dayCol}>
                  <View
                    style={[
                      styles.dayCircle,
                      {
                        backgroundColor:
                          i < activeDay
                            ? "#F97316"
                            : i === activeDay
                            ? palette.primary
                            : palette.border,
                      },
                    ]}
                  >
                    {i < activeDay ? (
                      <Text style={styles.checkMark}>✓</Text>
                    ) : (
                      <Text
                        style={[
                          styles.dayNum,
                          { color: i === activeDay ? "#FFF" : palette.textMuted },
                        ]}
                      >
                        {i === activeDay ? "🔥" : "·"}
                      </Text>
                    )}
                  </View>
                  <Text style={[styles.dayLabel, { color: palette.textMuted }]}>{day}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Earned badges */}
          {earned.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: palette.text }]}>
                Earned Badges ✨
              </Text>
              <View style={styles.badgeGrid}>
                {earned.map((b) => (
                  <View
                    key={b.id}
                    style={[styles.badgeCard, { backgroundColor: b.color + "20" }]}
                  >
                    <Text style={styles.badgeEmoji}>{b.emoji}</Text>
                    <Text style={[styles.badgeName, { color: b.color }]}>{b.name}</Text>
                    <Text style={[styles.badgeHindi, { color: b.color + "CC" }]}>
                      {b.nameHindi}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Locked badges */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>
              Badges to Unlock 🔒
            </Text>
            <View style={styles.badgeGrid}>
              {locked.map((b) => (
                <View
                  key={b.id}
                  style={[
                    styles.badgeCard,
                    { backgroundColor: palette.card, opacity: 0.6 },
                  ]}
                >
                  <Text style={[styles.badgeEmoji, { opacity: 0.4 }]}>{b.emoji}</Text>
                  <Text style={[styles.badgeName, { color: palette.textMuted }]}>
                    {b.name}
                  </Text>
                  <Text style={[styles.badgeDesc, { color: palette.textLight }]}>
                    {b.desc}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 20, gap: 4 },
  title: { fontSize: 26, fontWeight: "800" },
  sub: { fontSize: 15 },
  statsRow: { flexDirection: "row", gap: 12, paddingHorizontal: 24, marginTop: 20 },
  statCard: {
    borderRadius: 20, padding: 16, alignItems: "center", gap: 4,
    shadowColor: "#7C5CBF", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  statEmoji: { fontSize: 24 },
  statValue: { fontSize: 26, fontWeight: "800" },
  statLabel: { fontSize: 12, fontWeight: "500" },
  levelCard: {
    marginHorizontal: 24, marginTop: 16, borderRadius: 20, padding: 20, gap: 12,
    shadowColor: "#7C5CBF", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  levelHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  levelTitle: { fontSize: 17, fontWeight: "700" },
  levelSub: { fontSize: 13, fontWeight: "600" },
  calendarCard: {
    marginHorizontal: 24, marginTop: 16, borderRadius: 20, padding: 20, gap: 16,
    shadowColor: "#7C5CBF", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  calTitle: { fontSize: 17, fontWeight: "700" },
  weekRow: { flexDirection: "row", justifyContent: "space-between" },
  dayCol: { alignItems: "center", gap: 6 },
  dayCircle: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: "center", justifyContent: "center",
  },
  checkMark: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  dayNum: { fontSize: 14, fontWeight: "700" },
  dayLabel: { fontSize: 11, fontWeight: "600" },
  section: { paddingHorizontal: 24, marginTop: 24, gap: 14 },
  sectionTitle: { fontSize: 20, fontWeight: "800" },
  badgeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  badgeCard: {
    width: "30%", borderRadius: 16, padding: 14, alignItems: "center", gap: 6,
  },
  badgeEmoji: { fontSize: 32 },
  badgeName: { fontSize: 12, fontWeight: "700", textAlign: "center" },
  badgeHindi: { fontSize: 11, textAlign: "center" },
  badgeDesc: { fontSize: 10, textAlign: "center" },
});
