import React, { useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, Dimensions,
  TouchableOpacity, Animated, Easing,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

const PRIMARY   = "#DC2626"; // Red
const SECONDARY = "#0EA5E9"; // Sky blue
const YELLOW    = "#FBBF24";
const GREEN     = "#10B981";
const BG        = "#FFF5F5";

// Floating animals around the screen
const FLOATERS = [
  { emoji: "🐘", x: 0.08, y: 0.10, size: 48, speed: 2200 },
  { emoji: "🦁", x: 0.75, y: 0.08, size: 44, speed: 2600 },
  { emoji: "🐸", x: 0.82, y: 0.28, size: 38, speed: 1900 },
  { emoji: "⭐", x: 0.05, y: 0.32, size: 32, speed: 1600 },
  { emoji: "🐥", x: 0.88, y: 0.52, size: 36, speed: 2400 },
  { emoji: "🌈", x: 0.03, y: 0.56, size: 40, speed: 2000 },
  { emoji: "🎈", x: 0.78, y: 0.72, size: 38, speed: 2800 },
  { emoji: "⭐", x: 0.10, y: 0.78, size: 28, speed: 1700 },
  { emoji: "🦋", x: 0.85, y: 0.88, size: 34, speed: 2300 },
];

const ACTIVITIES = [
  { emoji: "🎵", label: "Rhymes", hindi: "राइम्स", color: "#FEF2F2", border: "#FECACA" },
  { emoji: "🐾", label: "Animals", hindi: "जानवर", color: "#F0FDF4", border: "#BBF7D0" },
  { emoji: "🔢", label: "Numbers", hindi: "गिनती", color: "#EFF6FF", border: "#BFDBFE" },
  { emoji: "🎨", label: "Drawing", hindi: "चित्र", color: "#FDF2F8", border: "#FBCFE8" },
  { emoji: "📖", label: "Stories", hindi: "कहानी", color: "#FFFBEB", border: "#FDE68A" },
  { emoji: "🌈", label: "Colors", hindi: "रंग", color: "#F5F3FF", border: "#DDD6FE" },
];

function FloatingEmoji({ emoji, x, y, size, speed }: {
  emoji: string; x: number; y: number; size: number; speed: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: speed, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: speed, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -14] });
  const rotate     = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: ["-6deg", "6deg", "-6deg"] });

  return (
    <Animated.Text
      style={{
        position: "absolute",
        left: x * width,
        top: y * height * 0.85,
        fontSize: size,
        transform: [{ translateY }, { rotate }],
        opacity: 0.85,
      }}
    >
      {emoji}
    </Animated.Text>
  );
}

export default function WelcomeScreen() {
  const logoScale   = useRef(new Animated.Value(0)).current;
  const logoRotate  = useRef(new Animated.Value(0)).current;
  const titleSlide  = useRef(new Animated.Value(40)).current;
  const titleOpacity= useRef(new Animated.Value(0)).current;
  const btnPulse    = useRef(new Animated.Value(1)).current;
  const cardsSlide  = useRef(new Animated.Value(60)).current;
  const cardsOpacity= useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo pop-in
    Animated.spring(logoScale, { toValue: 1, bounciness: 18, speed: 6, useNativeDriver: true }).start();
    Animated.timing(logoRotate, { toValue: 1, duration: 600, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }).start();

    // Title slide up
    Animated.parallel([
      Animated.timing(titleSlide,  { toValue: 0, duration: 500, delay: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(titleOpacity,{ toValue: 1, duration: 500, delay: 300, useNativeDriver: true }),
    ]).start();

    // Cards slide up
    Animated.parallel([
      Animated.timing(cardsSlide,  { toValue: 0, duration: 500, delay: 550, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(cardsOpacity,{ toValue: 1, duration: 500, delay: 550, useNativeDriver: true }),
    ]).start();

    // Button pulse loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(btnPulse, { toValue: 1.04, duration: 700, useNativeDriver: true }),
        Animated.timing(btnPulse, { toValue: 1.00, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const logoSpin = logoRotate.interpolate({ inputRange: [0, 1], outputRange: ["-20deg", "0deg"] });

  return (
    <View style={styles.container}>

      {/* Floating background characters */}
      {FLOATERS.map((f, i) => (
        <FloatingEmoji key={i} {...f} />
      ))}

      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.inner}>

          {/* ── Logo ── */}
          <Animated.View style={[styles.logoWrap, { transform: [{ scale: logoScale }, { rotate: logoSpin }] }]}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🌟</Text>
            </View>
            {/* Decorative ring */}
            <View style={[styles.logoRing, { borderColor: YELLOW }]} />
          </Animated.View>

          {/* ── App name + tagline ── */}
          <Animated.View style={{ alignItems: "center", transform: [{ translateY: titleSlide }], opacity: titleOpacity }}>
            <Text style={styles.appName}>
              <Text style={{ color: PRIMARY }}>Kiddo</Text>
              <Text style={{ color: SECONDARY }}>Learn</Text>
            </Text>

            {/* Tagline pill */}
            <View style={styles.taglinePill}>
              <Text style={styles.taglineText}>🎉 रील्स नहीं, रियल लर्निंग!</Text>
            </View>
          </Animated.View>

          {/* ── Activity cards ── */}
          <Animated.View style={[styles.grid, { transform: [{ translateY: cardsSlide }], opacity: cardsOpacity }]}>
            {ACTIVITIES.map((a) => (
              <View key={a.label} style={[styles.actCard, { backgroundColor: a.color, borderColor: a.border }]}>
                <Text style={styles.actEmoji}>{a.emoji}</Text>
                <Text style={styles.actLabel}>{a.label}</Text>
                <Text style={styles.actHindi}>{a.hindi}</Text>
              </View>
            ))}
          </Animated.View>

          {/* ── Age row ── */}
          <Animated.View style={[styles.ageRow, { opacity: cardsOpacity }]}>
            <Text style={styles.ageTitle}>For ages</Text>
            {[
              { label: "2-3 yrs", color: GREEN },
              { label: "3-5 yrs", color: PRIMARY },
              { label: "5-8 yrs", color: SECONDARY },
            ].map((a) => (
              <View key={a.label} style={[styles.agePill, { backgroundColor: a.color }]}>
                <Text style={styles.ageText}>{a.label}</Text>
              </View>
            ))}
          </Animated.View>

          {/* ── CTA ── */}
          <Animated.View style={[styles.ctaWrap, { transform: [{ scale: btnPulse }] }]}>
            <TouchableOpacity
              style={styles.startBtn}
              onPress={() => router.push("/auth/register")}
              activeOpacity={0.88}
            >
              <Text style={styles.startEmoji}>🚀</Text>
              <Text style={styles.startText}>Get Started — Free!</Text>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity onPress={() => router.push("/auth/login")} style={styles.loginRow}>
            <Text style={styles.loginText}>
              Already have an account?{"  "}
              <Text style={{ color: PRIMARY, fontWeight: "800" }}>Log In</Text>
            </Text>
          </TouchableOpacity>

        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  inner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 18,
  },

  // Logo
  logoWrap: { alignItems: "center", justifyContent: "center" },
  logoCircle: {
    width: 110, height: 110, borderRadius: 32,
    backgroundColor: PRIMARY,
    alignItems: "center", justifyContent: "center",
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4, shadowRadius: 20, elevation: 10,
  },
  logoEmoji: { fontSize: 60 },
  logoRing: {
    position: "absolute",
    width: 128, height: 128, borderRadius: 38,
    borderWidth: 3, borderStyle: "dashed",
  },

  // Title
  appName: { fontSize: 42, fontWeight: "900", letterSpacing: -1 },
  taglinePill: {
    marginTop: 8,
    backgroundColor: YELLOW + "30",
    borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 6,
    borderWidth: 1.5, borderColor: YELLOW,
  },
  taglineText: { fontSize: 15, fontWeight: "700", color: "#92400E" },

  // Activity grid
  grid: {
    flexDirection: "row", flexWrap: "wrap",
    gap: 10, justifyContent: "center",
    width: "100%",
  },
  actCard: {
    width: (width - 70) / 3,
    borderRadius: 18, padding: 12,
    alignItems: "center", gap: 4,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  actEmoji: { fontSize: 32 },
  actLabel: { fontSize: 11, fontWeight: "800", color: "#1C1917", textAlign: "center" },
  actHindi: { fontSize: 10, color: "#6B7280", textAlign: "center" },

  // Age row
  ageRow: {
    flexDirection: "row", alignItems: "center",
    gap: 8,
  },
  ageTitle: { fontSize: 13, fontWeight: "700", color: "#6B7280" },
  agePill: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  ageText: { fontSize: 13, fontWeight: "800", color: "#FFF" },

  // CTA
  ctaWrap: { width: "100%" },
  startBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 22,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
  },
  startEmoji: { fontSize: 24 },
  startText: { fontSize: 20, fontWeight: "900", color: "#FFF" },

  loginRow: { marginTop: -4 },
  loginText: { fontSize: 14, color: "#9CA3AF" },
});
