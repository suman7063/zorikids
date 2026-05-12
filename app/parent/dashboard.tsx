import React from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useChildStore } from "../../src/stores/childStore";
import { useSettingsStore } from "../../src/stores/settingsStore";
import { Colors, ACTIVITY_META } from "../../src/theme";

const MOCK_WEEKLY_ACTIVITY = [
  { day: "Mon", minutes: 22, activities: 3 },
  { day: "Tue", minutes: 18, activities: 2 },
  { day: "Wed", minutes: 25, activities: 4 },
  { day: "Thu", minutes: 15, activities: 2 },
  { day: "Fri", minutes: 30, activities: 5 },
  { day: "Sat", minutes: 20, activities: 3 },
  { day: "Sun", minutes: 10, activities: 1 },
];

const MOCK_SUBJECT_BREAKDOWN = [
  { type: "quiz", pct: 35, count: 7 },
  { type: "story", pct: 25, count: 5 },
  { type: "math", pct: 20, count: 4 },
  { type: "hindi", pct: 12, count: 2 },
  { type: "meditation", pct: 8, count: 2 },
];

const MAX_MINUTES = Math.max(...MOCK_WEEKLY_ACTIVITY.map((d) => d.minutes));

export default function ParentDashboard() {
  const activeChild = useChildStore((s) => s.activeChild);
  const streak = useChildStore((s) => s.streak);
  const totalXP = useChildStore((s) => s.totalXP);
  const isDark = useSettingsStore((s) => s.isDarkMode);
  const palette = isDark ? Colors.dark : Colors.light;

  const totalMinutes = MOCK_WEEKLY_ACTIVITY.reduce((s, d) => s + d.minutes, 0);
  const totalActivities = MOCK_WEEKLY_ACTIVITY.reduce((s, d) => s + d.activities, 0);
  const avgMinutes = Math.round(totalMinutes / 7);

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ fontSize: 22, color: palette.text }}>✕ Close</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: palette.text }]}>Parent Dashboard</Text>
          <TouchableOpacity onPress={() => router.push("/parent/settings")}>
            <Text style={{ fontSize: 22 }}>⚙️</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Child info */}
          {activeChild && (
            <View style={[styles.childCard, { backgroundColor: palette.primary }]}>
              <View style={[styles.miniAvatar, { backgroundColor: activeChild.avatar_color }]}>
                <Text style={{ fontSize: 32 }}>{activeChild.avatar_emoji}</Text>
              </View>
              <View>
                <Text style={styles.childCardName}>{activeChild.name}</Text>
                <Text style={styles.childCardAge}>Age {activeChild.age} • {activeChild.age_group}</Text>
              </View>
              <View style={styles.childCardStats}>
                <Text style={styles.childCardXP}>⭐ {totalXP} XP</Text>
                <Text style={styles.childCardStreak}>🔥 {streak?.current_streak ?? 0} days</Text>
              </View>
            </View>
          )}

          {/* Summary stats */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: palette.card }]}>
              <Text style={styles.statEmoji}>📅</Text>
              <Text style={[styles.statNum, { color: palette.text }]}>{totalMinutes} min</Text>
              <Text style={[styles.statLabel, { color: palette.textMuted }]}>This Week</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: palette.card }]}>
              <Text style={styles.statEmoji}>⚡</Text>
              <Text style={[styles.statNum, { color: palette.text }]}>{totalActivities}</Text>
              <Text style={[styles.statLabel, { color: palette.textMuted }]}>Activities</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: palette.card }]}>
              <Text style={styles.statEmoji}>⏱️</Text>
              <Text style={[styles.statNum, { color: palette.text }]}>{avgMinutes} min</Text>
              <Text style={[styles.statLabel, { color: palette.textMuted }]}>Avg/Day</Text>
            </View>
          </View>

          {/* Weekly bar chart */}
          <View style={[styles.chartCard, { backgroundColor: palette.card }]}>
            <Text style={[styles.chartTitle, { color: palette.text }]}>
              📊 Daily Screen Time
            </Text>
            <View style={styles.barChart}>
              {MOCK_WEEKLY_ACTIVITY.map((d) => {
                const barHeight = Math.max(8, (d.minutes / MAX_MINUTES) * 120);
                const isToday = d.day === ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date().getDay()];
                return (
                  <View key={d.day} style={styles.barCol}>
                    <Text style={[styles.barMinutes, { color: palette.textMuted }]}>
                      {d.minutes}m
                    </Text>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: barHeight,
                          backgroundColor: isToday ? palette.primary : palette.primary + "60",
                        },
                      ]}
                    />
                    <Text style={[styles.barDay, { color: isToday ? palette.primary : palette.textMuted, fontWeight: isToday ? "700" : "500" }]}>
                      {d.day}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Subject breakdown */}
          <View style={[styles.subjectCard, { backgroundColor: palette.card }]}>
            <Text style={[styles.chartTitle, { color: palette.text }]}>
              📚 Learning Breakdown
            </Text>
            <View style={styles.subjectList}>
              {MOCK_SUBJECT_BREAKDOWN.map((s) => {
                const meta = ACTIVITY_META[s.type as keyof typeof ACTIVITY_META];
                const actColor = Colors.activity[s.type as keyof typeof Colors.activity];
                return (
                  <View key={s.type} style={styles.subjectRow}>
                    <Text style={styles.subjectEmoji}>{meta.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <View style={styles.subjectHeader}>
                        <Text style={[styles.subjectName, { color: palette.text }]}>
                          {meta.label}
                        </Text>
                        <Text style={[styles.subjectCount, { color: palette.textMuted }]}>
                          {s.count} sessions
                        </Text>
                      </View>
                      <View style={[styles.subjectTrack, { backgroundColor: palette.border }]}>
                        <View
                          style={[
                            styles.subjectFill,
                            { width: `${s.pct}%`, backgroundColor: actColor.icon },
                          ]}
                        />
                      </View>
                    </View>
                    <Text style={[styles.subjectPct, { color: actColor.icon }]}>{s.pct}%</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Insights */}
          <View style={[styles.insightCard, { backgroundColor: "#EDE9FE" }]}>
            <Text style={styles.insightTitle}>🧠 Parent Insights</Text>
            <View style={styles.insightList}>
              <Text style={styles.insightItem}>
                ✅ {activeChild?.name ?? "Your child"} is most active on Friday
              </Text>
              <Text style={styles.insightItem}>
                ✅ Quiz activities are most preferred (35%)
              </Text>
              <Text style={styles.insightItem}>
                💡 Try adding more Story time — great for language development
              </Text>
              <Text style={styles.insightItem}>
                💡 Avg screen time {avgMinutes} min/day is within healthy range
              </Text>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12,
  },
  title: { fontSize: 18, fontWeight: "700" },
  childCard: {
    marginHorizontal: 20, marginTop: 8, borderRadius: 20, padding: 20,
    flexDirection: "row", alignItems: "center", gap: 14,
  },
  miniAvatar: {
    width: 56, height: 56, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
  },
  childCardName: { color: "#FFF", fontSize: 18, fontWeight: "800" },
  childCardAge: { color: "rgba(255,255,255,0.7)", fontSize: 13 },
  childCardStats: { marginLeft: "auto", gap: 4 },
  childCardXP: { color: "#FFF", fontWeight: "700", fontSize: 14 },
  childCardStreak: { color: "#FFF", fontWeight: "700", fontSize: 14 },
  statsGrid: {
    flexDirection: "row", gap: 12, paddingHorizontal: 20, marginTop: 16,
  },
  statCard: {
    flex: 1, borderRadius: 16, padding: 14, alignItems: "center", gap: 4,
    shadowColor: "#7C5CBF", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  statEmoji: { fontSize: 22 },
  statNum: { fontSize: 20, fontWeight: "800" },
  statLabel: { fontSize: 11, fontWeight: "500" },
  chartCard: {
    marginHorizontal: 20, marginTop: 16, borderRadius: 20, padding: 20, gap: 20,
    shadowColor: "#7C5CBF", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 3,
  },
  chartTitle: { fontSize: 16, fontWeight: "700" },
  barChart: { flexDirection: "row", alignItems: "flex-end", gap: 8, height: 160 },
  barCol: { flex: 1, alignItems: "center", gap: 4 },
  barMinutes: { fontSize: 10, fontWeight: "500" },
  bar: { width: "80%", borderRadius: 6 },
  barDay: { fontSize: 11 },
  subjectCard: {
    marginHorizontal: 20, marginTop: 16, borderRadius: 20, padding: 20, gap: 16,
    shadowColor: "#7C5CBF", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 3,
  },
  subjectList: { gap: 16 },
  subjectRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  subjectEmoji: { fontSize: 22 },
  subjectHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  subjectName: { fontSize: 14, fontWeight: "600" },
  subjectCount: { fontSize: 12 },
  subjectTrack: { height: 8, borderRadius: 4, overflow: "hidden" },
  subjectFill: { height: 8, borderRadius: 4 },
  subjectPct: { fontSize: 14, fontWeight: "700", minWidth: 36, textAlign: "right" },
  insightCard: {
    marginHorizontal: 20, marginTop: 16, borderRadius: 20, padding: 20, gap: 12,
  },
  insightTitle: { fontSize: 16, fontWeight: "700", color: "#5B21B6" },
  insightList: { gap: 10 },
  insightItem: { fontSize: 14, color: "#4C1D95", lineHeight: 22 },
});
