import React, { useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSettingsStore } from "../../src/stores/settingsStore";
import { Colors } from "../../src/theme";

const DAILY_LIMITS = [15, 20, 30, 45, 60, 90];
const BREAK_REMINDERS = [10, 15, 20, 25, 30];
const ALLOWED_TYPES = [
  { id: "quiz", label: "Quiz", emoji: "🧠" },
  { id: "story", label: "Story", emoji: "📖" },
  { id: "math", label: "Math", emoji: "🔢" },
  { id: "hindi", label: "Hindi", emoji: "क" },
  { id: "english", label: "English", emoji: "A" },
  { id: "drawing", label: "Art", emoji: "🎨" },
  { id: "meditation", label: "Calm", emoji: "🧘" },
];

export default function ParentSettings() {
  const isDark = useSettingsStore((s) => s.isDarkMode);
  const isEye = useSettingsStore((s) => s.isEyeProtection);
  const toggleDark = useSettingsStore((s) => s.toggleDarkMode);
  const toggleEye = useSettingsStore((s) => s.toggleEyeProtection);
  const palette = isDark ? Colors.dark : Colors.light;

  const [dailyLimit, setDailyLimit] = useState(30);
  const [breakReminder, setBreakReminder] = useState(20);
  const [allowed, setAllowed] = useState<string[]>(ALLOWED_TYPES.map((t) => t.id));

  function toggleAllowed(id: string) {
    setAllowed((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  function handleSave() {
    Alert.alert("Settings Saved!", "Your parental settings have been updated.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  }

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ fontSize: 22, color: palette.text }}>✕</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: palette.text }]}>Parental Controls</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={{ fontSize: 16, color: palette.primary, fontWeight: "700" }}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Screen time */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>
              📱 Daily Screen Limit
            </Text>
            <Text style={[styles.sectionSub, { color: palette.textMuted }]}>
              {dailyLimit} minutes per day
            </Text>
            <View style={styles.chipRow}>
              {DAILY_LIMITS.map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setDailyLimit(m)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: dailyLimit === m ? palette.primary : palette.card,
                      borderColor: dailyLimit === m ? palette.primary : palette.border,
                    },
                  ]}
                >
                  <Text style={[styles.chipText, { color: dailyLimit === m ? "#FFF" : palette.text }]}>
                    {m} min
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Break reminders */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>
              👁️ Eye Break Reminder
            </Text>
            <Text style={[styles.sectionSub, { color: palette.textMuted }]}>
              Remind every {breakReminder} minutes (20-20-20 rule)
            </Text>
            <View style={styles.chipRow}>
              {BREAK_REMINDERS.map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setBreakReminder(m)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: breakReminder === m ? Colors.light.secondary : palette.card,
                      borderColor: breakReminder === m ? Colors.light.secondary : palette.border,
                    },
                  ]}
                >
                  <Text style={[styles.chipText, { color: breakReminder === m ? "#FFF" : palette.text }]}>
                    {m} min
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Display settings */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>🎨 Display</Text>
            <View style={[styles.settingsList, { backgroundColor: palette.card }]}>
              <View style={styles.settingRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingLabel, { color: palette.text }]}>Dark Mode</Text>
                  <Text style={[styles.settingDesc, { color: palette.textMuted }]}>डार्क मोड — reduces eye strain</Text>
                </View>
                <TouchableOpacity
                  onPress={toggleDark}
                  style={[styles.toggle, { backgroundColor: isDark ? palette.primary : palette.border }]}
                >
                  <View style={[styles.knob, { transform: [{ translateX: isDark ? 20 : 2 }] }]} />
                </TouchableOpacity>
              </View>
              <View style={[styles.divider, { backgroundColor: palette.border }]} />
              <View style={styles.settingRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingLabel, { color: palette.text }]}>Eye Protection Mode</Text>
                  <Text style={[styles.settingDesc, { color: palette.textMuted }]}>Warm screen tone — reduces blue light</Text>
                </View>
                <TouchableOpacity
                  onPress={toggleEye}
                  style={[styles.toggle, { backgroundColor: isEye ? Colors.light.secondary : palette.border }]}
                >
                  <View style={[styles.knob, { transform: [{ translateX: isEye ? 20 : 2 }] }]} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Allowed content */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>✅ Allowed Activities</Text>
            <Text style={[styles.sectionSub, { color: palette.textMuted }]}>
              Choose what your child can access
            </Text>
            <View style={styles.allowGrid}>
              {ALLOWED_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => toggleAllowed(t.id)}
                  style={[
                    styles.allowCard,
                    {
                      backgroundColor: allowed.includes(t.id) ? palette.primary + "15" : palette.card,
                      borderColor: allowed.includes(t.id) ? palette.primary : palette.border,
                    },
                  ]}
                >
                  <Text style={styles.allowEmoji}>{t.emoji}</Text>
                  <Text style={[styles.allowLabel, { color: allowed.includes(t.id) ? palette.primary : palette.textMuted }]}>
                    {t.label}
                  </Text>
                  <Text style={{ fontSize: 16 }}>{allowed.includes(t.id) ? "✅" : "⬜"}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 20-20-20 rule */}
          <View style={[styles.infoCard, { backgroundColor: "#EFF6FF" }]}>
            <Text style={styles.infoTitle}>💡 20-20-20 Rule for Kids</Text>
            <Text style={styles.infoText}>
              Every 20 minutes, look at something 20 feet away for 20 seconds. This helps prevent digital eye strain in children.
            </Text>
            <Text style={styles.infoHindi}>
              हर 20 मिनट में, 20 फीट दूर किसी चीज़ को 20 सेकंड के लिए देखें।
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: palette.primary }]}
            onPress={handleSave}
          >
            <Text style={styles.saveBtnText}>Save Settings ✅</Text>
          </TouchableOpacity>

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
  section: { paddingHorizontal: 20, marginTop: 20, gap: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "700" },
  sectionSub: { fontSize: 13 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 2,
  },
  chipText: { fontSize: 14, fontWeight: "600" },
  settingsList: { borderRadius: 20, overflow: "hidden" },
  settingRow: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 16,
  },
  settingLabel: { fontSize: 15, fontWeight: "600" },
  settingDesc: { fontSize: 12, marginTop: 2 },
  divider: { height: 1, marginHorizontal: 16 },
  toggle: {
    width: 44, height: 26, borderRadius: 13, justifyContent: "center",
  },
  knob: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#FFF" },
  allowGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  allowCard: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, borderWidth: 2,
  },
  allowEmoji: { fontSize: 18 },
  allowLabel: { fontSize: 14, fontWeight: "600" },
  infoCard: { margin: 20, borderRadius: 20, padding: 20, gap: 8 },
  infoTitle: { fontSize: 15, fontWeight: "700", color: "#1D4ED8" },
  infoText: { fontSize: 14, color: "#1E40AF", lineHeight: 22 },
  infoHindi: { fontSize: 13, color: "#3B82F6", fontStyle: "italic" },
  saveBtn: {
    marginHorizontal: 20, padding: 18, borderRadius: 18, alignItems: "center",
    shadowColor: "#7C5CBF", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  saveBtnText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
});
