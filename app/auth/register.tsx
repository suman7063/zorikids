import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, Alert, KeyboardAvoidingView, Platform, Animated,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../src/lib/supabase";
import { useAuthStore } from "../../src/stores/authStore";
import { useChildStore } from "../../src/stores/childStore";
import { AGE_WORLDS, getAgeWorld } from "../../src/theme/ageThemes";

// Age options
const AGE_OPTIONS = [
  { label: "2–3", world: "baby",     emoji: "🐣" },
  { label: "3–5", world: "explorer", emoji: "🚀" },
  { label: "5–8", world: "champion", emoji: "🏆" },
] as const;

type WorldKey = "baby" | "explorer" | "champion";

const AVATARS: Record<WorldKey, string[]> = {
  baby:     ["🐘", "🐮", "🐸", "🐥", "🦁", "🐼", "🐷", "🐨"],
  explorer: ["🦁", "🐯", "🦊", "🐺", "🦝", "🐻", "🦄", "🐸"],
  champion: ["🦸", "🧙", "👩‍🚀", "🧑‍🎨", "👨‍🔬", "🤖", "🦊", "🐼"],
};

function getAgeGroup(age: number) {
  if (age <= 5) return "toddler";
  if (age <= 7) return "early";
  if (age <= 10) return "middle";
  return "upper";
}

function midAge(world: WorldKey): number {
  if (world === "baby")     return 3;
  if (world === "explorer") return 4;
  return 6;
}

export default function SetupScreen() {
  const setSession    = useAuthStore((s) => s.setSession);
  const setActiveChild = useChildStore((s) => s.setActiveChild);

  // Parent
  const [parentName, setParentName] = useState("");
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");

  // Child
  const [childName, setChildName]       = useState("");
  const [selectedWorld, setSelectedWorld] = useState<WorldKey | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState("🐘");
  const [language, setLanguage]         = useState<"hindi" | "english" | "both">("both");

  const [loading, setLoading] = useState(false);

  const cardAnim = useRef(new Animated.Value(1)).current;
  const worldTheme = selectedWorld ? AGE_WORLDS[selectedWorld] : null;
  const primary = worldTheme?.colors.primary ?? "#DC2626";
  const bgColor = worldTheme?.colors.background ?? "#FFF5F5";

  useEffect(() => {
    if (selectedWorld) {
      setSelectedAvatar(AVATARS[selectedWorld][0]);
      Animated.sequence([
        Animated.timing(cardAnim, { toValue: 0.88, duration: 100, useNativeDriver: true }),
        Animated.spring(cardAnim, { toValue: 1, bounciness: 14, useNativeDriver: true }),
      ]).start();
    }
  }, [selectedWorld]);

  const handleCreate = async () => {
    if (!parentName.trim()) return Alert.alert("Oops!", "Aapka naam likhein.");
    if (!email.trim())      return Alert.alert("Oops!", "Email likhein.");
    if (password.length < 6) return Alert.alert("Oops!", "Password kam se kam 6 characters ka hona chahiye.");
    if (!childName.trim())  return Alert.alert("Oops!", "Bachche ka naam likhein.");
    if (!selectedWorld)     return Alert.alert("Oops!", "Bachche ki umar chunein.");

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: parentName.trim() } },
    });

    if (error) {
      setLoading(false);
      return Alert.alert("Sign Up Failed", error.message);
    }

    if (!data.session || !data.user) {
      setLoading(false);
      return Alert.alert("Verify Email", "Email verify karein phir login karein.");
    }

    // Create parent profile
    await supabase.from("profiles").upsert({
      id: data.user.id,
      email: data.user.email,
      full_name: parentName.trim(),
    });

    // Create child profile
    const age = midAge(selectedWorld);
    const { data: childData, error: childError } = await supabase
      .from("children")
      .insert({
        parent_id: data.user.id,
        name: childName.trim(),
        age,
        age_group: getAgeGroup(age),
        avatar_emoji: selectedAvatar,
        avatar_color: worldTheme!.colors.primary,
        preferred_language: language,
        interests: [],
      })
      .select()
      .single();

    if (!childError && childData) {
      await supabase.from("streaks").insert({
        child_id: childData.id,
        current_streak: 0,
        longest_streak: 0,
        last_active_date: new Date().toISOString().split("T")[0],
      });
      // ✅ Store mein immediately set karo — language instantly apply hogi
      setActiveChild(childData);
    }

    setLoading(false);
    setSession(data.session);
    router.replace("/(tabs)/home");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: bgColor }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <Text style={[styles.backText, { color: primary }]}>← Back</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerEmoji}>
              {worldTheme ? worldTheme.mascot : "🌟"}
            </Text>
            <Text style={styles.heading}>Account Setup</Text>
            <Text style={[styles.sub, { color: primary }]}>
              Parent + Bachcha — ek saath!
            </Text>
          </View>

          {/* ━━━ SECTION 1: Child Age ━━━ */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: primary }]}>
              👶 Bachche ki umar?
            </Text>
            <View style={styles.ageRow}>
              {AGE_OPTIONS.map((opt) => {
                const t = AGE_WORLDS[opt.world];
                const sel = selectedWorld === opt.world;
                return (
                  <TouchableOpacity
                    key={opt.world}
                    onPress={() => setSelectedWorld(opt.world)}
                    style={[
                      styles.ageCard,
                      { borderColor: t.colors.primary + "50" },
                      sel && { backgroundColor: t.colors.primary, borderColor: t.colors.primary },
                    ]}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.ageEmoji}>{opt.emoji}</Text>
                    <Text style={[styles.ageLabel, sel && { color: "#FFF" }]}>
                      {opt.label} yrs
                    </Text>
                    <Text style={[styles.ageWorld, { color: sel ? "rgba(255,255,255,0.85)" : t.colors.primary }]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* World preview card */}
          {worldTheme && selectedWorld && (
            <Animated.View style={[
              styles.worldCard,
              { backgroundColor: primary, transform: [{ scale: cardAnim }] },
            ]}>
              <Text style={styles.worldMascot}>{worldTheme.mascot}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.worldTitle}>{worldTheme.emoji} {worldTheme.label}</Text>
                <Text style={styles.worldDesc}>
                  {selectedWorld === "baby"
                    ? "🎵 Rhymes • 🐾 Animals • 🌈 Colors"
                    : selectedWorld === "explorer"
                    ? "📚 ABC • 🔢 123 • 📖 Stories • 🧠 Quiz"
                    : "🏆 Quiz • ➕ Math • 📖 Hindi • 🇬🇧 English"}
                </Text>
                <View style={styles.charsRow}>
                  {worldTheme.characters.slice(0, 5).map((c, i) => (
                    <Text key={i} style={{ fontSize: 20 }}>{c}</Text>
                  ))}
                </View>
              </View>
            </Animated.View>
          )}

          {/* ━━━ SECTION 2: Child Name + Avatar ━━━ */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: primary }]}>
              😊 Bachche ka naam aur avatar
            </Text>

            <TextInput
              style={[styles.input, { borderColor: primary + "50" }]}
              value={childName}
              onChangeText={setChildName}
              placeholder="Bachche ka naam (e.g. Aarav)"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="words"
            />

            {selectedWorld && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: "row", gap: 10, paddingVertical: 4 }}>
                  {AVATARS[selectedWorld].map((av) => (
                    <TouchableOpacity
                      key={av}
                      onPress={() => setSelectedAvatar(av)}
                      style={[
                        styles.avatarBtn,
                        { backgroundColor: primary + "15" },
                        selectedAvatar === av && {
                          backgroundColor: primary + "30",
                          borderWidth: 3, borderColor: primary,
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 30 }}>{av}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>

          {/* ━━━ SECTION 3: Language ━━━ */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: primary }]}>
              🌏 Preferred Language
            </Text>
            <View style={styles.langRow}>
              {(["hindi", "english", "both"] as const).map((lang) => (
                <TouchableOpacity
                  key={lang}
                  onPress={() => setLanguage(lang)}
                  style={[
                    styles.langBtn,
                    { borderColor: primary + "50" },
                    language === lang && { backgroundColor: primary, borderColor: primary },
                  ]}
                >
                  <Text style={[
                    styles.langText,
                    { color: primary },
                    language === lang && { color: "#FFF" },
                  ]}>
                    {lang === "hindi" ? "🇮🇳 हिंदी" : lang === "english" ? "🇬🇧 English" : "🌏 Dono"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ━━━ SECTION 4: Parent Details ━━━ */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: primary }]}>
              👪 Parent ka account
            </Text>

            <TextInput
              style={[styles.input, { borderColor: primary + "50" }]}
              value={parentName}
              onChangeText={setParentName}
              placeholder="Aapka naam (e.g. Priya Sharma)"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="words"
            />
            <TextInput
              style={[styles.input, { borderColor: primary + "50" }]}
              value={email}
              onChangeText={setEmail}
              placeholder="Email address"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={[styles.input, { borderColor: primary + "50" }]}
              value={password}
              onChangeText={setPassword}
              placeholder="Password (min. 6 characters)"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
            />
          </View>

          {/* ━━━ Submit ━━━ */}
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: primary, opacity: loading ? 0.7 : 1 }]}
            onPress={handleCreate}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>
              {loading
                ? "Bana rahe hain... ⏳"
                : `Shuru Karein ${worldTheme?.emoji ?? "🚀"}`}
            </Text>
          </TouchableOpacity>

          <Text style={styles.terms}>
            Aapke bachche ka data kabhi share nahi hoga 🔒
          </Text>

        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 24, gap: 24, paddingBottom: 48 },

  back: { marginBottom: 4 },
  backText: { fontSize: 16, fontWeight: "600" },

  header: { alignItems: "center", gap: 6 },
  headerEmoji: { fontSize: 64 },
  heading: { fontSize: 28, fontWeight: "900", color: "#1C1917" },
  sub: { fontSize: 15, fontWeight: "600" },

  section: { gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "800" },

  // Age cards
  ageRow: { flexDirection: "row", gap: 10 },
  ageCard: {
    flex: 1, borderRadius: 18, padding: 12,
    alignItems: "center", gap: 4,
    backgroundColor: "#FFF", borderWidth: 2,
  },
  ageEmoji: { fontSize: 28 },
  ageLabel: { fontSize: 15, fontWeight: "800", color: "#1C1917" },
  ageWorld: { fontSize: 10, fontWeight: "600" },

  // World card
  worldCard: {
    borderRadius: 22, padding: 18,
    flexDirection: "row", alignItems: "center", gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2, shadowRadius: 12, elevation: 6,
  },
  worldMascot: { fontSize: 52 },
  worldTitle:  { fontSize: 18, fontWeight: "800", color: "#FFF" },
  worldDesc:   { fontSize: 12, color: "rgba(255,255,255,0.85)", marginTop: 4 },
  charsRow:    { flexDirection: "row", gap: 6, marginTop: 8 },

  // Avatar
  avatarBtn: {
    width: 56, height: 56, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
  },

  // Language
  langRow: { flexDirection: "row", gap: 10 },
  langBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 14,
    alignItems: "center", backgroundColor: "#FFF", borderWidth: 2,
  },
  langText: { fontSize: 13, fontWeight: "700" },

  // Input
  input: {
    height: 54, backgroundColor: "#FFF", borderRadius: 16,
    paddingHorizontal: 18, fontSize: 15, color: "#1C1917", borderWidth: 2,
  },

  // Button
  btn: {
    borderRadius: 18, paddingVertical: 18, alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
  },
  btnText: { fontSize: 18, fontWeight: "900", color: "#FFF" },

  terms: { fontSize: 12, color: "#9CA3AF", textAlign: "center" },
});
