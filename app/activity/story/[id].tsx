import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Dimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Colors } from "../../../src/theme";
import { useSettingsStore } from "../../../src/stores/settingsStore";
import { useChildStore } from "../../../src/stores/childStore";

const { width } = Dimensions.get("window");

const STORIES: Record<string, {
  title: string;
  titleHindi: string;
  emoji: string;
  xp: number;
  pages: Array<{ text: string; emoji: string; bg: string }>;
}> = {
  s1: {
    title: "The Brave Little Cloud",
    titleHindi: "बहादुर छोटा बादल",
    emoji: "⛅",
    xp: 30,
    pages: [
      { emoji: "☀️", bg: "#FFF7ED", text: "Once upon a time, in the vast blue sky, there lived a tiny little cloud named Chumki.\n\nChumki was small, but she had a big dream — she wanted to water all the flowers in the world!" },
      { emoji: "🌸", bg: "#FDF2F8", text: "Every morning, Chumki looked down at the dry earth and felt sad.\n\n\"The flowers are thirsty,\" she said. \"I want to help them!\"" },
      { emoji: "🌧️", bg: "#EFF6FF", text: "One day, Chumki gathered all her courage. She took a deep breath and let the rain pour down!\n\nDrop by drop, the earth became wet and cool." },
      { emoji: "🌈", bg: "#F5F0FF", text: "The flowers bloomed and danced! The birds sang songs of joy!\n\nAnd Chumki felt the happiest she had ever been.\n\nSometimes, even the smallest ones can make the biggest difference! 🌟" },
    ],
  },
  s2: {
    title: "Panchatantra — Lion & Mouse",
    titleHindi: "शेर और चूहा",
    emoji: "🦁",
    xp: 30,
    pages: [
      { emoji: "😴", bg: "#FFF7ED", text: "Once, a mighty lion was sleeping in the jungle.\n\nA little mouse was playing nearby and accidentally ran over the lion's nose!" },
      { emoji: "😤", bg: "#FEF2F2", text: "The lion woke up angrily and caught the mouse in his paw.\n\n\"How dare you wake me up!\" roared the lion." },
      { emoji: "🙏", bg: "#ECFDF5", text: "\"Please forgive me, O mighty King!\" begged the mouse. \"One day, I will help you too!\"\n\nThe lion laughed. \"You? Help ME? Ha ha ha!\"\n\nBut he let the mouse go free." },
      { emoji: "🕸️", bg: "#FFF7ED", text: "Some days later, the lion got trapped in a hunter's net.\n\nHe roared and roared but could not escape!\n\nThe little mouse heard his cries and came running." },
      { emoji: "✂️", bg: "#ECFDF5", text: "The mouse chewed through the ropes — nibble nibble nibble — until the lion was free!\n\n\"Never underestimate anyone,\" smiled the mouse.\n\nAnd they became the best of friends forever! 🌟" },
    ],
  },
};

const DEFAULT_STORY = STORIES.s1;

export default function StoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const story = STORIES[id] ?? DEFAULT_STORY;

  const [page, setPage] = useState(0);
  const [finished, setFinished] = useState(false);

  const isDark = useSettingsStore((s) => s.isDarkMode);
  const addXP = useChildStore((s) => s.addXP);
  const palette = isDark ? Colors.dark : Colors.light;

  const isLast = page === story.pages.length - 1;
  const current = story.pages[page];
  const progress = ((page + 1) / story.pages.length) * 100;

  function nextPage() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isLast) {
      addXP(story.xp);
      setFinished(true);
    } else {
      setPage((p) => p + 1);
    }
  }

  if (finished) {
    return (
      <View style={[styles.container, { backgroundColor: palette.background }]}>
        <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 24 }}>
          <Text style={{ fontSize: 80 }}>📚</Text>
          <Text style={[styles.finTitle, { color: palette.text }]}>Story Complete!</Text>
          <Text style={{ fontSize: 18, color: palette.textMuted }}>कहानी खत्म!</Text>
          <View style={[styles.xpCard, { backgroundColor: palette.card }]}>
            <Text style={{ fontSize: 40, fontWeight: "800", color: Colors.activity.story.icon }}>
              +{story.xp} XP
            </Text>
            <Text style={{ color: palette.textMuted }}>Reading Reward</Text>
          </View>
          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: Colors.activity.story.icon }]}
            onPress={() => router.back()}
          >
            <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 16 }}>Back to Home 🏠</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? palette.background : current.bg }]}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ fontSize: 24, color: palette.text }}>✕</Text>
          </TouchableOpacity>
          <Text style={[styles.storyTitle, { color: palette.text }]}>
            {story.emoji} {story.title}
          </Text>
          <Text style={[styles.pageNum, { color: palette.textMuted }]}>
            {page + 1}/{story.pages.length}
          </Text>
        </View>

        {/* Progress dots */}
        <View style={styles.dots}>
          {story.pages.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i <= page ? Colors.activity.story.icon : palette.border,
                  width: i === page ? 20 : 8,
                },
              ]}
            />
          ))}
        </View>

        {/* Story content */}
        <ScrollView
          contentContainerStyle={styles.storyContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.pageEmoji}>{current.emoji}</Text>
          <Text style={[styles.storyText, { color: isDark ? palette.text : "#1E1B4B" }]}>
            {current.text}
          </Text>
        </ScrollView>

        {/* Navigation */}
        <View style={styles.navRow}>
          {page > 0 && (
            <TouchableOpacity
              onPress={() => setPage((p) => p - 1)}
              style={[styles.prevBtn, { backgroundColor: palette.card }]}
            >
              <Text style={[styles.navText, { color: palette.textMuted }]}>← Prev</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={nextPage}
            style={[styles.nextBtn, { backgroundColor: Colors.activity.story.icon, flex: 1 }]}
          >
            <Text style={styles.nextText}>{isLast ? "Finish Story 🎉" : "Next Page →"}</Text>
          </TouchableOpacity>
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
  storyTitle: { fontSize: 14, fontWeight: "700", flex: 1, textAlign: "center" },
  pageNum: { fontSize: 13 },
  dots: { flexDirection: "row", gap: 6, justifyContent: "center", paddingVertical: 8 },
  dot: { height: 8, borderRadius: 4 },
  storyContent: { flex: 1, paddingHorizontal: 28, paddingVertical: 20, alignItems: "center", gap: 24 },
  pageEmoji: { fontSize: 80 },
  storyText: {
    fontSize: 20, lineHeight: 34, fontWeight: "500",
    textAlign: "center", letterSpacing: 0.2,
  },
  navRow: {
    flexDirection: "row", gap: 12, paddingHorizontal: 20, paddingBottom: 20, paddingTop: 12,
  },
  prevBtn: { paddingHorizontal: 20, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  navText: { fontWeight: "600", fontSize: 15 },
  nextBtn: { padding: 18, borderRadius: 18, alignItems: "center" },
  nextText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
  finTitle: { fontSize: 32, fontWeight: "800" },
  xpCard: { borderRadius: 20, padding: 24, alignItems: "center", gap: 4, width: "100%" },
  doneBtn: { width: "100%", padding: 18, borderRadius: 18, alignItems: "center" },
});
