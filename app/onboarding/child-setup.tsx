import React, { useState } from "react";
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, Alert,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../src/lib/supabase";
import { useAuthStore } from "../../src/stores/authStore";
import { KiddoButton } from "../../src/components/ui/KiddoButton";
import { Colors, AGE_GROUPS } from "../../src/theme";
import type { AgeGroup } from "../../src/types";

const AVATARS = ["🐻", "🦁", "🐼", "🦊", "🐨", "🦄", "🐸", "🐯", "🦋", "🐙"];
const AVATAR_COLORS = Colors.avatarColors;
const INTERESTS = [
  { id: "animals", label: "Animals", emoji: "🐾" },
  { id: "space", label: "Space", emoji: "🚀" },
  { id: "nature", label: "Nature", emoji: "🌿" },
  { id: "sports", label: "Sports", emoji: "⚽" },
  { id: "music", label: "Music", emoji: "🎵" },
  { id: "art", label: "Art", emoji: "🎨" },
  { id: "cooking", label: "Cooking", emoji: "🍳" },
  { id: "robots", label: "Robots", emoji: "🤖" },
];

function getAgeGroup(age: number): AgeGroup {
  if (age <= 5) return "toddler";
  if (age <= 7) return "early";
  if (age <= 10) return "middle";
  return "upper";
}

export default function ChildSetupScreen() {
  const user = useAuthStore((s) => s.user);
  const session = useAuthStore((s) => s.session);

  const [childName, setChildName] = useState("");
  const [age, setAge] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("🐻");
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [language, setLanguage] = useState<"hindi" | "english" | "both">("both");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCreate = async () => {
    const ageNum = parseInt(age);
    if (!childName || !age || isNaN(ageNum) || ageNum < 3 || ageNum > 12) {
      Alert.alert("Oops!", "Please enter your child's name and age (3–12).");
      return;
    }

    const parentId = session?.user?.id;
    if (!parentId) return;

    setLoading(true);
    const { error } = await supabase.from("children").insert({
      parent_id: parentId,
      name: childName,
      age: ageNum,
      age_group: getAgeGroup(ageNum),
      avatar_emoji: selectedAvatar,
      avatar_color: selectedColor,
      interests: selectedInterests,
      preferred_language: language,
    });

    if (!error) {
      await supabase.from("streaks").insert({
        child_id: parentId,
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

  const ageGroup = age ? getAgeGroup(parseInt(age)) : null;
  const ageGroupInfo = ageGroup ? AGE_GROUPS[ageGroup] : null;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.light.background }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.emoji}>👦</Text>
            <Text style={styles.heading}>Create Child Profile</Text>
            <Text style={styles.sub}>बच्चे की प्रोफाइल बनाएं</Text>
          </View>

          {/* Avatar picker */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose Avatar</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.avatarRow}>
                {AVATARS.map((av) => (
                  <TouchableOpacity
                    key={av}
                    onPress={() => setSelectedAvatar(av)}
                    style={[
                      styles.avatarBtn,
                      { backgroundColor: selectedColor },
                      selectedAvatar === av && styles.avatarSelected,
                    ]}
                  >
                    <Text style={styles.avatarEmoji}>{av}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.colorRow}>
              {AVATAR_COLORS.map((c) => (
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

          {/* Name & Age */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Name & Age</Text>
            <TextInput
              style={styles.input}
              value={childName}
              onChangeText={setChildName}
              placeholder="Child's name (e.g. Aarav)"
              placeholderTextColor={Colors.light.textLight}
              autoCapitalize="words"
            />
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              placeholder="Age (3–12)"
              placeholderTextColor={Colors.light.textLight}
              keyboardType="number-pad"
              maxLength={2}
            />
            {ageGroupInfo && (
              <View style={styles.ageGroupBadge}>
                <Text style={styles.ageGroupEmoji}>{ageGroupInfo.emoji}</Text>
                <Text style={styles.ageGroupText}>
                  {ageGroupInfo.label} — {ageGroupInfo.range}
                </Text>
              </View>
            )}
          </View>

          {/* Interests */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interests (optional)</Text>
            <View style={styles.interestGrid}>
              {INTERESTS.map((i) => (
                <TouchableOpacity
                  key={i.id}
                  onPress={() => toggleInterest(i.id)}
                  style={[
                    styles.interestPill,
                    selectedInterests.includes(i.id) && styles.interestSelected,
                  ]}
                >
                  <Text style={styles.interestEmoji}>{i.emoji}</Text>
                  <Text
                    style={[
                      styles.interestLabel,
                      selectedInterests.includes(i.id) && { color: "#FFF" },
                    ]}
                  >
                    {i.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Language */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferred Language</Text>
            <View style={styles.langRow}>
              {(["hindi", "english", "both"] as const).map((lang) => (
                <TouchableOpacity
                  key={lang}
                  onPress={() => setLanguage(lang)}
                  style={[
                    styles.langBtn,
                    language === lang && styles.langSelected,
                  ]}
                >
                  <Text style={[styles.langText, language === lang && { color: "#FFF" }]}>
                    {lang === "hindi" ? "🇮🇳 हिंदी" : lang === "english" ? "🇬🇧 English" : "🌏 Both"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <KiddoButton
            label="Start Learning Journey! 🚀"
            onPress={handleCreate}
            loading={loading}
            size="lg"
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 24, paddingBottom: 40 },
  header: { alignItems: "center", gap: 8 },
  emoji: { fontSize: 56 },
  heading: { fontSize: 26, fontWeight: "800", color: Colors.light.text },
  sub: { fontSize: 15, color: Colors.light.textMuted },
  section: { gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: Colors.light.text },
  avatarRow: { flexDirection: "row", gap: 10 },
  avatarBtn: {
    width: 60, height: 60, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
  },
  avatarSelected: { borderWidth: 3, borderColor: Colors.light.text },
  avatarEmoji: { fontSize: 30 },
  colorRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  colorSelected: { borderWidth: 3, borderColor: Colors.light.text },
  input: {
    height: 54, backgroundColor: "#FFF", borderRadius: 16,
    paddingHorizontal: 18, fontSize: 15, color: Colors.light.text,
    borderWidth: 2, borderColor: Colors.light.border,
  },
  ageGroupBadge: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: Colors.light.primary + "15",
    padding: 12, borderRadius: 12,
  },
  ageGroupEmoji: { fontSize: 20 },
  ageGroupText: { fontSize: 14, fontWeight: "600", color: Colors.light.primary },
  interestGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  interestPill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: "#FFF", borderWidth: 2, borderColor: Colors.light.border,
  },
  interestSelected: {
    backgroundColor: Colors.light.primary, borderColor: Colors.light.primary,
  },
  interestEmoji: { fontSize: 16 },
  interestLabel: { fontSize: 13, fontWeight: "600", color: Colors.light.text },
  langRow: { flexDirection: "row", gap: 10 },
  langBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 14,
    alignItems: "center", backgroundColor: "#FFF",
    borderWidth: 2, borderColor: Colors.light.border,
  },
  langSelected: { backgroundColor: Colors.light.primary, borderColor: Colors.light.primary },
  langText: { fontSize: 13, fontWeight: "700", color: Colors.light.text },
});
