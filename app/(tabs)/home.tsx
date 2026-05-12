import React, { useEffect, useRef } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Dimensions, Alert,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../src/stores/authStore";
import { useChildStore } from "../../src/stores/childStore";
import { useSettingsStore } from "../../src/stores/settingsStore";
import { ActivityCard } from "../../src/components/ui/ActivityCard";
import { StreakBadge } from "../../src/components/ui/StreakBadge";
import { XPBar } from "../../src/components/ui/XPBar";
import { Colors, ACTIVITY_META, AGE_GROUPS } from "../../src/theme";
import type { ActivityType } from "../../src/types";

const { width } = Dimensions.get("window");

const FEATURED_ACTIVITIES: Array<{
  id: string;
  type: ActivityType;
  title: string;
  subtitle: string;
  xp: number;
}> = [
  { id: "q1", type: "quiz", title: "Animal Kingdom Quiz", subtitle: "10 fun questions", xp: 50 },
  { id: "s1", type: "story", title: "The Brave Little Cloud", subtitle: "A rainy day adventure", xp: 30 },
  { id: "m1", type: "math", title: "Addition Adventure", subtitle: "Count with fruits!", xp: 40 },
  { id: "h1", type: "hindi", title: "वर्णमाला सीखो", subtitle: "Learn Hindi alphabets", xp: 35 },
  { id: "e1", type: "english", title: "Sight Words Fun", subtitle: "Read common words", xp: 35 },
];

const QUICK_ACTIVITIES: Array<{ type: ActivityType; route: string }> = [
  { type: "drawing", route: "/activity/drawing" },
  { type: "meditation", route: "/activity/meditation" },
  { type: "math", route: "/activity/math/m1" },
  { type: "story", route: "/activity/story/s1" },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: "Good Morning", emoji: "🌅", hindi: "सुप्रभात" };
  if (h < 17) return { text: "Good Afternoon", emoji: "☀️", hindi: "नमस्ते" };
  return { text: "Good Evening", emoji: "🌙", hindi: "शुभ संध्या" };
}

export default function HomeScreen() {
  const session = useAuthStore((s) => s.session);
  const activeChild = useChildStore((s) => s.activeChild);
  const streak = useChildStore((s) => s.streak);
  const totalXP = useChildStore((s) => s.totalXP);
  const fetchChildren = useChildStore((s) => s.fetchChildren);
  const fetchStreak = useChildStore((s) => s.fetchStreak);
  const fetchTotalXP = useChildStore((s) => s.fetchTotalXP);
  const isDark = useSettingsStore((s) => s.isDarkMode);
  const startSession = useSettingsStore((s) => s.startSession);
  const settings = useSettingsStore((s) => s.settings);
  const breakTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const palette = isDark ? Colors.dark : Colors.light;
  const greeting = getGreeting();

  useEffect(() => {
    if (session?.user?.id) {
      fetchChildren(session.user.id);
    }
  }, [session]);

  useEffect(() => {
    if (activeChild) {
      fetchStreak(activeChild.id);
      fetchTotalXP(activeChild.id);
    }
  }, [activeChild]);

  useEffect(() => {
    startSession();
    const breakMinutes = settings?.break_reminder_minutes ?? 20;
    breakTimer.current = setTimeout(() => {
      Alert.alert(
        "👀 Eye Break Time!",
        `You've been learning for ${breakMinutes} minutes. Look away from the screen for 20 seconds — look at something 20 feet away!\n\n20-20-20 नियम!`,
        [{ text: "OK, will do! 😊" }]
      );
    }, breakMinutes * 60 * 1000);

    return () => {
      if (breakTimer.current) clearTimeout(breakTimer.current);
    };
  }, []);

  const level = Math.floor(totalXP / 200) + 1;
  const xpInLevel = totalXP % 200;
  const ageGroupInfo = activeChild ? AGE_GROUPS[activeChild.age_group] : null;

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View>
                <Text style={[styles.greetingEmoji]}>
                  {greeting.emoji} {greeting.hindi}
                </Text>
                <Text style={[styles.childName, { color: palette.text }]}>
                  {activeChild?.name ?? "Little Learner"}!
                </Text>
              </View>
              <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                {streak && <StreakBadge streak={streak.current_streak} compact />}
                <TouchableOpacity
                  onPress={() => router.push("/parent/dashboard")}
                  style={[styles.parentBtn, { backgroundColor: palette.card }]}
                >
                  <Text style={styles.parentBtnText}>👪</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* XP Bar */}
            <View style={[styles.xpCard, { backgroundColor: palette.card }]}>
              <XPBar xp={xpInLevel} level={level} xpForNext={200} />
              {ageGroupInfo && (
                <View style={styles.ageGroup}>
                  <Text style={styles.ageGroupEmoji}>{ageGroupInfo.emoji}</Text>
                  <Text style={[styles.ageGroupLabel, { color: palette.textMuted }]}>
                    {ageGroupInfo.label}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Today's featured activity */}
          <View style={styles.section}>
            <View style={styles.featuredCard}>
              <View style={styles.featuredContent}>
                <Text style={styles.featuredTag}>⭐ Today's Pick</Text>
                <Text style={styles.featuredTitle}>Animal Kingdom Quiz</Text>
                <Text style={styles.featuredSub}>Test your knowledge about animals!</Text>
                <TouchableOpacity
                  style={styles.featuredBtn}
                  onPress={() => router.push("/activity/quiz/q1")}
                  activeOpacity={0.85}
                >
                  <Text style={styles.featuredBtnText}>Start Now →</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.featuredEmoji}>🦁</Text>
            </View>
          </View>

          {/* Quick Activities */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>Quick Activities</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.quickRow}>
                {QUICK_ACTIVITIES.map((qa) => (
                  <TouchableOpacity
                    key={qa.type}
                    onPress={() => router.push(qa.route as any)}
                    style={[styles.quickCard, { backgroundColor: Colors.activity[qa.type].bg }]}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.quickEmoji}>{ACTIVITY_META[qa.type].emoji}</Text>
                    <Text style={[styles.quickLabel, { color: Colors.activity[qa.type].text }]}>
                      {ACTIVITY_META[qa.type].labelHindi}
                    </Text>
                    <Text style={[styles.quickEn, { color: Colors.activity[qa.type].icon }]}>
                      {ACTIVITY_META[qa.type].label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Featured Activities */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: palette.text }]}>
                Activities For You
              </Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/learn")}>
                <Text style={{ color: palette.primary, fontWeight: "600", fontSize: 13 }}>
                  See All →
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: "row", gap: 12, paddingRight: 24 }}>
                {FEATURED_ACTIVITIES.map((act) => (
                  <ActivityCard
                    key={act.id}
                    type={act.type}
                    title={act.title}
                    subtitle={act.subtitle}
                    xp={act.xp}
                    onPress={() => {
                      const routeMap: Record<ActivityType, string> = {
                        quiz: `/activity/quiz/${act.id}`,
                        story: `/activity/story/${act.id}`,
                        math: `/activity/math/${act.id}`,
                        drawing: "/activity/drawing",
                        meditation: "/activity/meditation",
                        hindi: `/activity/quiz/${act.id}`,
                        english: `/activity/quiz/${act.id}`,
                      };
                      router.push(routeMap[act.type] as any);
                    }}
                  />
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Daily goals */}
          <View style={[styles.goalsCard, { backgroundColor: palette.card, marginHorizontal: 24 }]}>
            <Text style={[styles.goalsTitle, { color: palette.text }]}>Today's Goals 🎯</Text>
            <View style={styles.goalsList}>
              {[
                { label: "Complete 1 Quiz", done: false, emoji: "🧠" },
                { label: "Read a Story", done: false, emoji: "📖" },
                { label: "Practice Meditation", done: false, emoji: "🧘" },
              ].map((g) => (
                <View key={g.label} style={styles.goalItem}>
                  <Text style={styles.goalEmoji}>{g.done ? "✅" : g.emoji}</Text>
                  <Text
                    style={[
                      styles.goalLabel,
                      { color: g.done ? palette.textMuted : palette.text },
                      g.done && { textDecorationLine: "line-through" },
                    ]}
                  >
                    {g.label}
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
  header: { paddingHorizontal: 24, paddingTop: 16, gap: 16 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  greetingEmoji: { fontSize: 14, color: Colors.light.textMuted },
  childName: { fontSize: 26, fontWeight: "800", marginTop: 2 },
  parentBtn: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: "center", justifyContent: "center",
  },
  parentBtnText: { fontSize: 22 },
  xpCard: {
    borderRadius: 20, padding: 16, gap: 12,
    shadowColor: "#7C5CBF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
  },
  ageGroup: { flexDirection: "row", alignItems: "center", gap: 6 },
  ageGroupEmoji: { fontSize: 16 },
  ageGroupLabel: { fontSize: 13, fontWeight: "600" },
  section: { paddingHorizontal: 24, marginTop: 24, gap: 14 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 20, fontWeight: "800" },
  featuredCard: {
    backgroundColor: Colors.light.primary,
    borderRadius: 24, padding: 20,
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center",
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
  },
  featuredContent: { flex: 1, gap: 8 },
  featuredTag: { fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: "600" },
  featuredTitle: { fontSize: 20, fontWeight: "800", color: "#FFF" },
  featuredSub: { fontSize: 13, color: "rgba(255,255,255,0.8)" },
  featuredBtn: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 12, alignSelf: "flex-start", marginTop: 4,
  },
  featuredBtnText: { color: "#FFF", fontWeight: "700", fontSize: 14 },
  featuredEmoji: { fontSize: 60 },
  quickRow: { flexDirection: "row", gap: 12, paddingRight: 24 },
  quickCard: {
    width: 90, borderRadius: 20, padding: 14,
    alignItems: "center", gap: 6,
  },
  quickEmoji: { fontSize: 32 },
  quickLabel: { fontSize: 13, fontWeight: "700" },
  quickEn: { fontSize: 10, fontWeight: "500" },
  goalsCard: {
    borderRadius: 20, padding: 20, gap: 14, marginBottom: 16,
    shadowColor: "#7C5CBF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 3,
  },
  goalsTitle: { fontSize: 17, fontWeight: "700" },
  goalsList: { gap: 12 },
  goalItem: { flexDirection: "row", alignItems: "center", gap: 12 },
  goalEmoji: { fontSize: 22 },
  goalLabel: { fontSize: 15, fontWeight: "500" },
});
