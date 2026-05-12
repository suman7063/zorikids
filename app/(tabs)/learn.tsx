import React, { useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityCard } from "../../src/components/ui/ActivityCard";
import { Colors, ACTIVITY_META } from "../../src/theme";
import { useSettingsStore } from "../../src/stores/settingsStore";
import type { ActivityType } from "../../src/types";

const CATEGORIES: Array<{ key: ActivityType | "all"; label: string; emoji: string }> = [
  { key: "all", label: "All", emoji: "🌈" },
  { key: "quiz", label: "Quiz", emoji: "🧠" },
  { key: "story", label: "Story", emoji: "📖" },
  { key: "math", label: "Math", emoji: "🔢" },
  { key: "hindi", label: "Hindi", emoji: "क" },
  { key: "english", label: "English", emoji: "A" },
  { key: "drawing", label: "Art", emoji: "🎨" },
  { key: "meditation", label: "Calm", emoji: "🧘" },
];

const ALL_ACTIVITIES = [
  { id: "q1", type: "quiz" as ActivityType, title: "Animal Kingdom", subtitle: "10 questions", xp: 50 },
  { id: "q2", type: "quiz" as ActivityType, title: "Indian Festivals", subtitle: "Know your culture", xp: 50 },
  { id: "q3", type: "quiz" as ActivityType, title: "Science Wonders", subtitle: "Discover the world", xp: 60 },
  { id: "s1", type: "story" as ActivityType, title: "The Brave Little Cloud", subtitle: "Weather magic", xp: 30 },
  { id: "s2", type: "story" as ActivityType, title: "Panchatantra — Lion & Mouse", subtitle: "Friendship story", xp: 30 },
  { id: "s3", type: "story" as ActivityType, title: "Tenali Raman", subtitle: "Clever tales", xp: 35 },
  { id: "m1", type: "math" as ActivityType, title: "Addition Adventure", subtitle: "Add with fruits", xp: 40 },
  { id: "m2", type: "math" as ActivityType, title: "Subtraction Safari", subtitle: "Subtract animals", xp: 40 },
  { id: "m3", type: "math" as ActivityType, title: "Shapes & Patterns", subtitle: "Find the pattern", xp: 45 },
  { id: "h1", type: "hindi" as ActivityType, title: "वर्णमाला सीखो", subtitle: "Learn alphabets", xp: 35 },
  { id: "h2", type: "hindi" as ActivityType, title: "मात्राएं", subtitle: "Hindi vowels", xp: 40 },
  { id: "e1", type: "english" as ActivityType, title: "Sight Words", subtitle: "Common words", xp: 35 },
  { id: "e2", type: "english" as ActivityType, title: "Rhyming Fun", subtitle: "Poems & rhymes", xp: 30 },
  { id: "d1", type: "drawing" as ActivityType, title: "Free Drawing", subtitle: "Create anything!", xp: 20 },
  { id: "med1", type: "meditation" as ActivityType, title: "Breathing Bubbles", subtitle: "Calm & focus", xp: 25 },
  { id: "med2", type: "meditation" as ActivityType, title: "Body Scan", subtitle: "Relax each part", xp: 25 },
];

export default function LearnScreen() {
  const [selected, setSelected] = useState<ActivityType | "all">("all");
  const isDark = useSettingsStore((s) => s.isDarkMode);
  const palette = isDark ? Colors.dark : Colors.light;

  const filtered =
    selected === "all"
      ? ALL_ACTIVITIES
      : ALL_ACTIVITIES.filter((a) => a.type === selected);

  const getRoute = (act: (typeof ALL_ACTIVITIES)[0]) => {
    if (act.type === "drawing") return "/activity/drawing";
    if (act.type === "meditation") return "/activity/meditation";
    if (act.type === "quiz" || act.type === "hindi" || act.type === "english")
      return `/activity/quiz/${act.id}`;
    if (act.type === "story") return `/activity/story/${act.id}`;
    if (act.type === "math") return `/activity/math/${act.id}`;
    return "/activity/drawing";
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: palette.text }]}>Learn & Explore 📚</Text>
          <Text style={[styles.sub, { color: palette.textMuted }]}>सीखो और खेलो</Text>
        </View>

        {/* Category filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContent}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              onPress={() => setSelected(cat.key)}
              style={[
                styles.categoryPill,
                {
                  backgroundColor:
                    selected === cat.key ? palette.primary : palette.card,
                },
              ]}
              activeOpacity={0.8}
            >
              <Text style={styles.catEmoji}>{cat.emoji}</Text>
              <Text
                style={[
                  styles.catLabel,
                  { color: selected === cat.key ? "#FFF" : palette.textMuted },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Activities grid */}
        <ScrollView
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.gridWrap}>
            {filtered.map((act) => (
              <ActivityCard
                key={act.id}
                type={act.type}
                title={act.title}
                subtitle={act.subtitle}
                xp={act.xp}
                size="md"
                onPress={() => router.push(getRoute(act) as any)}
              />
            ))}
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
  categoryScroll: { marginTop: 16 },
  categoryContent: { paddingHorizontal: 24, gap: 8 },
  categoryPill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
  },
  catEmoji: { fontSize: 16 },
  catLabel: { fontSize: 13, fontWeight: "600" },
  grid: { paddingHorizontal: 24, paddingTop: 20 },
  gridWrap: { flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "space-between" },
});
