import React from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../src/stores/authStore";
import { useChildStore } from "../../src/stores/childStore";
import { useSettingsStore } from "../../src/stores/settingsStore";
import { Colors } from "../../src/theme";

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const activeChild = useChildStore((s) => s.activeChild);
  const children = useChildStore((s) => s.children);
  const setActiveChild = useChildStore((s) => s.setActiveChild);
  const isDark = useSettingsStore((s) => s.isDarkMode);
  const isEyeProt = useSettingsStore((s) => s.isEyeProtection);
  const toggleDark = useSettingsStore((s) => s.toggleDarkMode);
  const toggleEye = useSettingsStore((s) => s.toggleEyeProtection);
  const palette = isDark ? Colors.dark : Colors.light;

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => {
          signOut();
          router.replace("/auth/welcome");
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Child avatar */}
          {activeChild && (
            <View style={[styles.heroCard, { backgroundColor: palette.primary }]}>
              <View
                style={[styles.avatarCircle, { backgroundColor: activeChild.avatar_color }]}
              >
                <Text style={styles.avatarEmoji}>{activeChild.avatar_emoji}</Text>
              </View>
              <Text style={styles.heroName}>{activeChild.name}</Text>
              <Text style={styles.heroAge}>Age {activeChild.age} years</Text>
              <View style={styles.langBadge}>
                <Text style={styles.langText}>
                  {activeChild.preferred_language === "both"
                    ? "🌏 Hindi + English"
                    : activeChild.preferred_language === "hindi"
                    ? "🇮🇳 Hindi"
                    : "🇬🇧 English"}
                </Text>
              </View>
            </View>
          )}

          {/* Switch child */}
          {children.length > 1 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: palette.text }]}>Switch Child</Text>
              <View style={styles.childRow}>
                {children.map((child) => (
                  <TouchableOpacity
                    key={child.id}
                    onPress={() => setActiveChild(child)}
                    style={[
                      styles.childPill,
                      {
                        backgroundColor:
                          activeChild?.id === child.id
                            ? palette.primary
                            : palette.card,
                      },
                    ]}
                  >
                    <Text style={styles.childPillEmoji}>{child.avatar_emoji}</Text>
                    <Text
                      style={[
                        styles.childPillName,
                        {
                          color:
                            activeChild?.id === child.id ? "#FFF" : palette.text,
                        },
                      ]}
                    >
                      {child.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Settings */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>Settings</Text>

            <View style={[styles.settingsCard, { backgroundColor: palette.card }]}>
              <SettingRow
                emoji="🌙"
                label="Dark Mode"
                labelHindi="डार्क मोड"
                value={isDark}
                onToggle={toggleDark}
                palette={palette}
              />
              <View style={[styles.divider, { backgroundColor: palette.border }]} />
              <SettingRow
                emoji="👁️"
                label="Eye Protection"
                labelHindi="आँख सुरक्षा"
                value={isEyeProt}
                onToggle={toggleEye}
                palette={palette}
              />
            </View>
          </View>

          {/* Parent controls */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>Parent Controls</Text>
            <TouchableOpacity
              style={[styles.menuItem, { backgroundColor: palette.card }]}
              onPress={() => router.push("/parent/dashboard")}
            >
              <Text style={styles.menuEmoji}>📊</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.menuLabel, { color: palette.text }]}>Parent Dashboard</Text>
                <Text style={[styles.menuSub, { color: palette.textMuted }]}>
                  Track learning progress
                </Text>
              </View>
              <Text style={{ color: palette.textMuted }}>→</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuItem, { backgroundColor: palette.card }]}
              onPress={() => router.push("/parent/settings")}
            >
              <Text style={styles.menuEmoji}>⚙️</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.menuLabel, { color: palette.text }]}>
                  Screen Time & Limits
                </Text>
                <Text style={[styles.menuSub, { color: palette.textMuted }]}>
                  Set daily limits & breaks
                </Text>
              </View>
              <Text style={{ color: palette.textMuted }}>→</Text>
            </TouchableOpacity>
          </View>

          {/* Account */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>Account</Text>
            <View style={[styles.settingsCard, { backgroundColor: palette.card }]}>
              <View style={styles.accountRow}>
                <Text style={styles.menuEmoji}>👤</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.menuLabel, { color: palette.text }]}>
                    {user?.full_name ?? "Parent"}
                  </Text>
                  <Text style={[styles.menuSub, { color: palette.textMuted }]}>
                    {user?.email ?? ""}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.signOutBtn]}
              onPress={handleSignOut}
            >
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function SettingRow({
  emoji, label, labelHindi, value, onToggle, palette,
}: {
  emoji: string;
  label: string;
  labelHindi: string;
  value: boolean;
  onToggle: () => void;
  palette: any;
}) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.menuEmoji}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.menuLabel, { color: palette.text }]}>{label}</Text>
        <Text style={[styles.menuSub, { color: palette.textMuted }]}>{labelHindi}</Text>
      </View>
      <TouchableOpacity
        onPress={onToggle}
        style={[
          styles.toggle,
          { backgroundColor: value ? Colors.light.primary : palette.border },
        ]}
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.toggleKnob,
            { transform: [{ translateX: value ? 20 : 2 }] },
          ]}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroCard: {
    margin: 24, borderRadius: 24, padding: 28,
    alignItems: "center", gap: 8,
  },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 24,
    alignItems: "center", justifyContent: "center",
    marginBottom: 8,
  },
  avatarEmoji: { fontSize: 44 },
  heroName: { fontSize: 24, fontWeight: "800", color: "#FFF" },
  heroAge: { fontSize: 15, color: "rgba(255,255,255,0.8)" },
  langBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginTop: 4,
  },
  langText: { color: "#FFF", fontSize: 13, fontWeight: "600" },
  section: { paddingHorizontal: 24, marginTop: 16, gap: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "700" },
  childRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  childPill: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
  },
  childPillEmoji: { fontSize: 20 },
  childPillName: { fontSize: 14, fontWeight: "600" },
  settingsCard: { borderRadius: 20, overflow: "hidden" },
  settingRow: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 16,
  },
  divider: { height: 1, marginHorizontal: 16 },
  menuItem: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 16, borderRadius: 16,
  },
  accountRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  menuEmoji: { fontSize: 22 },
  menuLabel: { fontSize: 15, fontWeight: "600" },
  menuSub: { fontSize: 12, marginTop: 2 },
  toggle: {
    width: 44, height: 26, borderRadius: 13,
    justifyContent: "center",
  },
  toggleKnob: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: "#FFF",
  },
  signOutBtn: {
    backgroundColor: "#FEE2E2",
    borderRadius: 16, padding: 16, alignItems: "center",
  },
  signOutText: { color: "#DC2626", fontWeight: "700", fontSize: 15 },
});
