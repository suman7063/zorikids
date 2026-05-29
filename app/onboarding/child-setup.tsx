import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, Alert, Animated,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../src/lib/supabase";
import { useAuthStore } from "../../src/stores/authStore";
import { KiddoButton } from "../../src/components/ui/KiddoButton";
import { AGE_WORLDS, getAgeWorld } from "../../src/theme/ageThemes";
import type { AgeGroup } from "../../src/types";

const AVATARS_BY_WORLD = {
  baby:     ["🐘", "🐮", "🐸", "🐥", "🦁", "🐼", "🐷", "🐨", "🦊", "🐯"],
  explorer: ["🦁", "🐯", "🦊", "🐺", "🦝", "🐻", "🦄", "🐸", "🐼", "🐨"],
  champion: ["🦸", "🧙", "👩‍🚀", "🧑‍🎨", "👨‍🔬", "🤖", "🦊", "🐼", "🦁", "🐯"],
};

function getAgeGroup(age: number): AgeGroup {
  if (age <= 5) return "toddler";
  if (age <= 7) return "early";
  if (age <= 10) return "middle";
  return "upper";
}

export default function ChildSetupScreen() {
  const session = useAuthStore((s) => s.session);

  const [childName, setChildName] = useState("");
  const [age, setAge] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("🐘");
  const [selectedColor, setSelectedColor] = useState("#FDD835");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [language, setLanguage] = useState<"hindi" | "english" | "both">("both");
  const [loading, setLoading] = useState(false);

  const ageNum = parseInt(age);
  const world = !isNaN(ageNum) && ageNum >= 2 && ageNum <= 12
    ? getAgeWorld(ageNum)
    : null;
  const worldTheme = world ? AGE_WORLDS[world] : null;
  const avatars = world ? AVATARS_BY_WORLD[world] : AVATARS_BY_WORLD.explorer;

  // Animate theme card when world changes
  const cardAnim = useRef(new Animated.Value(1)).current;
  const prevWorld = useRef<string | null>(null);

  useEffect(() => {
    if (world && world !== prevWorld.current) {
      prevWorld.current = world;
      // Reset avatar to first of new world
      setSelectedAvatar(AVATARS_BY_WORLD[world][0]);
      setSelectedColor(AGE_WORLDS[world].colors.primary);
      // Bounce animation
      Animated.sequence([
        Animated.timing(cardAnim, { toValue: 0.85, duration: 120, useNativeDriver: true }),
        Animated.spring(cardAnim, { toValue: 1, useNativeDriver: true, bounciness: 14 }),
      ]).start();
    }
  }, [world]);

  const bgColor = worldTheme?.colors.background ?? "#FFF5F5";
  const primaryColor = worldTheme?.colors.primary ?? "#DC2626";
  const secondaryColor = worldTheme?.colors.secondary ?? "#0EA5E9";

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCreate = async () => {
    if (!childName || !age || isNaN(ageNum) || ageNum < 2 || ageNum > 12) {
      Alert.alert("Oops!", "Please enter your child's name and age (2–12).");
      return;
    }

    let parentId = session?.user?.id;
    if (!parentId) {
      const { data: sessionData } = await supabase.auth.getSession();
      parentId = sessionData.session?.user?.id;
    }
    if (!parentId) {
      Alert.alert("Session Error", "Please log in again to continue.");
      return;
    }

    setLoading(true);
    const { data: childData, error } = await supabase
      .from("children")
      .insert({
        parent_id: parentId,
        name: childName,
        age: ageNum,
        age_group: getAgeGroup(ageNum),
        avatar_emoji: selectedAvatar,
        avatar_color: selectedColor,
        interests: selectedInterests,
        preferred_language: language,
      })
      .select()
      .single();

    if (!error && childData) {
      await supabase.from("streaks").insert({
        child_id: childData.id,
        current_streak: 0,
        longest_streak: 0,
        last_active_date: new Date().toISOString().split("T")[0],
      });
    }

    setLoading(false);
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      router.replace("/(tabs)/home");
    }
  };

  const INTERESTS = worldTheme
    ? world === "baby"
      ? [
          { id: "animals", label: "Animals", emoji: "🐾" },
          { id: "music", label: "Music", emoji: "🎵" },
          { id: "nature", label: "Nature", emoji: "🌿" },
          { id: "colors", label: "Colors", emoji: "🌈" },
        ]
      : world === "explorer"
      ? [
          { id: "animals", label: "Animals", emoji: "🐾" },
          { id: "space", label: "Space", emoji: "🚀" },
          { id: "music", label: "Music", emoji: "🎵" },
          { id: "art", label: "Art", emoji: "🎨" },
          { id: "nature", label: "Nature", emoji: "🌿" },
          { id: "sports", label: "Sports", emoji: "⚽" },
        ]
      : [
          { id: "animals", label: "Animals", emoji: "🐾" },
          { id: "space", label: "Space", emoji: "🚀" },
          { id: "nature", label: "Nature", emoji: "🌿" },
          { id: "sports", label: "Sports", emoji: "⚽" },
          { id: "music", label: "Music", emoji: "🎵" },
          { id: "art", label: "Art", emoji: "🎨" },
          { id: "cooking", label: "Cooking", emoji: "🍳" },
          { id: "robots", label: "Robots", emoji: "🤖" },
        ]
    : [];

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace("/auth/welcome")}>
          <Text style={[styles.backText, { color: primaryColor }]}>← Back</Text>
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerEmoji}>👶</Text>
            <Text style={styles.heading}>Create Child Profile</Text>
            <Text style={[styles.sub, { color: primaryColor }]}>बच्चे की प्रोफाइल बनाएं</Text>
          </View>

          {/* Name & Age first — so world can be detected */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: primaryColor }]}>Name & Age</Text>
            <TextInput
              style={[styles.input, { borderColor: primaryColor + "50" }]}
              value={childName}
              onChangeText={setChildName}
              placeholder="Child's name (e.g. Aarav)"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="words"
            />
            <TextInput
              style={[styles.input, { borderColor: primaryColor + "50" }]}
              value={age}
              onChangeText={setAge}
              placeholder="Age (2–12)"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              maxLength={2}
            />
          </View>

          {/* World Preview Card — appears when age is entered */}
          {worldTheme && world && (
            <Animated.View style={[
              styles.worldCard,
              {
                backgroundColor: primaryColor,
                transform: [{ scale: cardAnim }],
              },
            ]}>
              <View style={styles.worldCardContent}>
                <Text style={styles.worldMascot}>{worldTheme.mascot}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.worldLabel}>{worldTheme.emoji} {worldTheme.label}</Text>
                  <Text style={styles.worldHindi}>{worldTheme.labelHindi}</Text>
                  <Text style={styles.worldAge}>{worldTheme.ageRange}</Text>
                </View>
              </View>

              {/* Characters row */}
              <View style={styles.charsRow}>
                {worldTheme.characters.slice(0, 5).map((c, i) => (
                  <Text key={i} style={styles.charEmoji}>{c}</Text>
                ))}
              </View>

              {/* World description */}
              <Text style={styles.worldDesc}>
                {world === "baby"
                  ? "🎵 Rhymes, animal sounds, colors & shapes"
                  : world === "explorer"
                  ? "📚 ABC, 123, stories & simple quizzes"
                  : "🏆 Quizzes, math, Hindi/English learning"}
              </Text>
            </Animated.View>
          )}

          {/* Avatar picker */}
          {worldTheme && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: primaryColor }]}>Choose Avatar</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.avatarRow}>
                  {avatars.map((av) => (
                    <TouchableOpacity
                      key={av}
                      onPress={() => setSelectedAvatar(av)}
                      style={[
                        styles.avatarBtn,
                        { backgroundColor: primaryColor + "20" },
                        selectedAvatar === av && {
                          borderWidth: 3,
                          borderColor: primaryColor,
                          backgroundColor: primaryColor + "30",
                        },
                      ]}
                    >
                      <Text style={styles.avatarEmoji}>{av}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* Color dots */}
              <View style={styles.colorRow}>
                {[primaryColor, secondaryColor, "#10B981", "#F97316", "#EC4899", "#8B5CF6", "#FBBF24", "#06B6D4"].map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setSelectedColor(c)}
                    style={[
                      styles.colorDot,
                      { backgroundColor: c },
                      selectedColor === c && styles.colorSelected,
                    ]}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Interests */}
          {INTERESTS.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: primaryColor }]}>
                Interests (optional)
              </Text>
              <View style={styles.interestGrid}>
                {INTERESTS.map((i) => (
                  <TouchableOpacity
                    key={i.id}
                    onPress={() => toggleInterest(i.id)}
                    style={[
                      styles.interestPill,
                      { borderColor: primaryColor + "40" },
                      selectedInterests.includes(i.id) && {
                        backgroundColor: primaryColor,
                        borderColor: primaryColor,
                      },
                    ]}
                  >
                    <Text style={styles.interestEmoji}>{i.emoji}</Text>
                    <Text style={[
                      styles.interestLabel,
                      selectedInterests.includes(i.id) && { color: "#FFF" },
                    ]}>
                      {i.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Language */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: primaryColor }]}>Preferred Language</Text>
            <View style={styles.langRow}>
              {(["hindi", "english", "both"] as const).map((lang) => (
                <TouchableOpacity
                  key={lang}
                  onPress={() => setLanguage(lang)}
                  style={[
                    styles.langBtn,
                    { borderColor: primaryColor + "40" },
                    language === lang && { backgroundColor: primaryColor, borderColor: primaryColor },
                  ]}
                >
                  <Text style={[
                    styles.langText,
                    { color: primaryColor },
                    language === lang && { color: "#FFF" },
                  ]}>
                    {lang === "hindi" ? "🇮🇳 हिंदी" : lang === "english" ? "🇬🇧 English" : "🌏 Both"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[styles.startBtn, { backgroundColor: primaryColor }]}>
            <TouchableOpacity onPress={handleCreate} disabled={loading} style={{ width: "100%", alignItems: "center", paddingVertical: 18 }}>
              <Text style={styles.startBtnText}>
                {loading ? "Creating..." : `Start ${worldTheme?.label ?? "Learning"} 🚀`}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 4 },
  backText: { fontSize: 16, fontWeight: "600" },
  scroll: { padding: 24, gap: 24 },

  header: { alignItems: "center", gap: 8 },
  headerEmoji: { fontSize: 56 },
  heading: { fontSize: 26, fontWeight: "800", color: "#1C1917" },
  sub: { fontSize: 15, fontWeight: "600" },

  section: { gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700" },

  input: {
    height: 54, backgroundColor: "#FFF", borderRadius: 16,
    paddingHorizontal: 18, fontSize: 15, color: "#1C1917",
    borderWidth: 2,
  },

  // World card
  worldCard: {
    borderRadius: 24, padding: 20, gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 16, elevation: 8,
  },
  worldCardContent: { flexDirection: "row", alignItems: "center", gap: 16 },
  worldMascot: { fontSize: 56 },
  worldLabel: { fontSize: 20, fontWeight: "800", color: "#FFF" },
  worldHindi: { fontSize: 14, color: "rgba(255,255,255,0.85)", fontWeight: "600" },
  worldAge: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  charsRow: { flexDirection: "row", gap: 8 },
  charEmoji: { fontSize: 28 },
  worldDesc: { fontSize: 13, color: "rgba(255,255,255,0.9)", fontWeight: "500" },

  // Avatar
  avatarRow: { flexDirection: "row", gap: 10 },
  avatarBtn: { width: 64, height: 64, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  avatarEmoji: { fontSize: 32 },
  colorRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  colorSelected: { borderWidth: 3, borderColor: "#1C1917" },

  // Interests
  interestGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  interestPill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: "#FFF", borderWidth: 2,
  },
  interestEmoji: { fontSize: 16 },
  interestLabel: { fontSize: 13, fontWeight: "600", color: "#1C1917" },

  // Language
  langRow: { flexDirection: "row", gap: 10 },
  langBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 14,
    alignItems: "center", backgroundColor: "#FFF", borderWidth: 2,
  },
  langText: { fontSize: 13, fontWeight: "700" },

  // Start button
  startBtn: {
    borderRadius: 20, alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
  },
  startBtnText: { color: "#FFF", fontWeight: "800", fontSize: 18 },
});
