import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { KiddoButton } from "../../src/components/ui/KiddoButton";
import { Colors } from "../../src/theme";

const { width, height } = Dimensions.get("window");

const FEATURES = [
  { emoji: "🧠", label: "Quiz & Brain Games", hindi: "क्विज़ और दिमागी खेल" },
  { emoji: "📖", label: "Story World", hindi: "कहानी की दुनिया" },
  { emoji: "🔢", label: "Math Magic", hindi: "गणित जादू" },
  { emoji: "🎨", label: "Art Studio", hindi: "कला स्टूडियो" },
  { emoji: "🧘", label: "Calm & Focus", hindi: "शांति और ध्यान" },
  { emoji: "🏆", label: "Earn Rewards", hindi: "पुरस्कार पाओ" },
];

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🌟</Text>
            </View>
            <Text style={styles.appName}>KiddoLearn</Text>
            <Text style={styles.taglineHindi}>रील्स नहीं, रियल लर्निंग!</Text>
            <Text style={styles.taglineEn}>Reels nahi, Real Learning</Text>
          </View>

          {/* Feature grid */}
          <View style={styles.grid}>
            {FEATURES.map((f) => (
              <View key={f.label} style={styles.featureCard}>
                <Text style={styles.featureEmoji}>{f.emoji}</Text>
                <Text style={styles.featureLabel}>{f.label}</Text>
                <Text style={styles.featureHindi}>{f.hindi}</Text>
              </View>
            ))}
          </View>

          {/* Age badges */}
          <View style={styles.ageBadges}>
            <Text style={styles.ageTitle}>For ages</Text>
            {["3-5", "6-7", "8-10", "11-12"].map((range) => (
              <View key={range} style={styles.agePill}>
                <Text style={styles.ageText}>{range}</Text>
              </View>
            ))}
          </View>

          {/* CTA */}
          <View style={styles.cta}>
            <KiddoButton
              label="Get Started — Free!"
              onPress={() => router.push("/auth/register")}
              size="lg"
            />
            <TouchableOpacity onPress={() => router.push("/auth/login")}>
              <Text style={styles.loginText}>
                Already have an account?{" "}
                <Text style={{ color: Colors.light.primary, fontWeight: "700" }}>
                  Log In
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  scroll: { paddingHorizontal: 24, paddingBottom: 32 },
  hero: { alignItems: "center", paddingTop: 40, paddingBottom: 32 },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  logoEmoji: { fontSize: 52 },
  appName: {
    fontSize: 36,
    fontWeight: "800",
    color: Colors.light.text,
    letterSpacing: -0.5,
  },
  taglineHindi: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.light.secondary,
    marginTop: 8,
  },
  taglineEn: {
    fontSize: 14,
    color: Colors.light.textMuted,
    marginTop: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
    marginBottom: 24,
  },
  featureCard: {
    width: (width - 72) / 3,
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    gap: 4,
    shadowColor: "#7C5CBF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  featureEmoji: { fontSize: 28 },
  featureLabel: { fontSize: 11, fontWeight: "700", color: Colors.light.text, textAlign: "center" },
  featureHindi: { fontSize: 10, color: Colors.light.textMuted, textAlign: "center" },
  ageBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
    marginBottom: 32,
  },
  ageTitle: { fontSize: 13, color: Colors.light.textMuted, fontWeight: "600" },
  agePill: {
    backgroundColor: Colors.light.primary + "20",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ageText: { fontSize: 13, fontWeight: "700", color: Colors.light.primary },
  cta: { gap: 16, alignItems: "center" },
  loginText: { fontSize: 14, color: Colors.light.textMuted },
});
