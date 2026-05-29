import React, { useState, useRef, useCallback } from "react";
import {
  View, Text, StyleSheet, Dimensions,
  FlatList, TouchableOpacity, Animated, StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Speech from "expo-speech";
import { useAgeTheme } from "../../src/hooks/useAgeTheme";
import { useChildStore } from "../../src/stores/childStore";
import { router } from "expo-router";

const { width, height } = Dimensions.get("window");

const RHYMES = [
  {
    id: "1", emoji: "🐘",
    title: "Ek Mota Hathi", hindi: "एक मोटा हाथी",
    lines_hi: ["एक मोटा हाथी", "झूम के चलता था", "सूंड हिलाता था", "मस्ती में गाता था"],
    lines_en: ["One fat elephant", "Walking with a sway", "Swinging his trunk", "Singing all the way"],
    bg: "#FEF9C3", color: "#D97706",
  },
  {
    id: "2", emoji: "🐟",
    title: "Machli Jal Ki Rani", hindi: "मछली जल की रानी है",
    lines_hi: ["मछली जल की रानी है", "जल में उसका पानी है", "हाथ लगाओ डर जाएगी", "बाहर निकालो मर जाएगी"],
    lines_en: ["Fish is the queen of water", "Water is her home", "Touch her she gets scared", "Outside she cannot roam"],
    bg: "#EFF6FF", color: "#2563EB",
  },
  {
    id: "3", emoji: "🌙",
    title: "Chanda Mama", hindi: "चंदा मामा दूर के",
    lines_hi: ["चंदा मामा दूर के", "पुए पकाए बूर के", "आप खाएं थाली में", "मुन्ने को दें प्याली में"],
    lines_en: ["Moon uncle far away", "Making sweets today", "You eat from a plate", "Give baby a small one great"],
    bg: "#F5F3FF", color: "#7C3AED",
  },
  {
    id: "4", emoji: "🌧️",
    title: "Rain Rain Go Away", hindi: "बारिश बारिश जाओ",
    lines_hi: ["बारिश बारिश जाओ जाओ", "कल फिर आना", "छोटे बच्चे खेलना चाहते हैं", "धूप को बुलाना"],
    lines_en: ["Rain rain go away", "Come again another day", "Little ones want to play", "Rain rain go away"],
    bg: "#ECFDF5", color: "#059669",
  },
  {
    id: "5", emoji: "⭐",
    title: "Twinkle Twinkle", hindi: "टिमटिम तारे",
    lines_hi: ["टिमटिम टिमटिम तारे", "कैसे चमकते प्यारे", "ऊपर आसमान में", "हीरे जैसे न्यारे"],
    lines_en: ["Twinkle twinkle little star", "How I wonder what you are", "Up above the world so high", "Like a diamond in the sky"],
    bg: "#FFF7ED", color: "#EA580C",
  },
  {
    id: "6", emoji: "🚌",
    title: "Wheels on the Bus", hindi: "बस के पहिये",
    lines_hi: ["बस के पहिये घूमते हैं", "घूम घूम घूम", "पूरे शहर में घूमते हैं", "घूम घूम घूम"],
    lines_en: ["Wheels on the bus go round and round", "Round and round round and round", "Wheels on the bus go round and round", "All through the town"],
    bg: "#FEF2F2", color: "#DC2626",
  },
];

// Stars burst on play
function StarBurst({ visible }: { visible: boolean }) {
  const anim = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    if (visible) {
      anim.setValue(0);
      Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    }
  }, [visible]);

  if (!visible) return null;
  const stars = ["⭐", "🌟", "✨", "💫", "⭐"];
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {stars.map((s, i) => {
        const angle = (i / stars.length) * Math.PI * 2;
        const tx = anim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(angle) * 80] });
        const ty = anim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(angle) * 80] });
        const op = anim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] });
        return (
          <Animated.Text key={i} style={{
            position: "absolute", left: "45%", top: "38%", fontSize: 24,
            transform: [{ translateX: tx }, { translateY: ty }], opacity: op,
          }}>
            {s}
          </Animated.Text>
        );
      })}
    </View>
  );
}

// Single full-screen rhyme reel
function RhymeReel({ rhyme, isActive, lang }: {
  rhyme: typeof RHYMES[0];
  isActive: boolean;
  lang: string;
}) {
  const [playing, setPlaying]       = useState(false);
  const [lineIdx, setLineIdx]       = useState(-1);
  const [showStars, setShowStars]   = useState(false);
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const lines = lang === "hindi" ? rhyme.lines_hi : rhyme.lines_en;
  const langCode = lang === "hindi" ? "hi-IN" : "en-IN";

  // Stop when not active
  React.useEffect(() => {
    if (!isActive) { Speech.stop(); setPlaying(false); setLineIdx(-1); }
  }, [isActive]);

  function doBounce() {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(bounceAnim, { toValue: 1.35, bounciness: 20, useNativeDriver: true }),
        Animated.timing(rotateAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(bounceAnim, { toValue: 1, bounciness: 10, useNativeDriver: true }),
        Animated.timing(rotateAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]),
    ]).start();
  }

  async function handlePlay() {
    if (playing) { Speech.stop(); setPlaying(false); setLineIdx(-1); return; }
    setPlaying(true);
    setShowStars(true);
    setTimeout(() => setShowStars(false), 1000);

    for (let i = 0; i < lines.length; i++) {
      setLineIdx(i);
      doBounce();
      await new Promise<void>((resolve) => {
        Speech.speak(lines[i], { language: langCode, rate: 0.82, onDone: resolve, onStopped: resolve });
      });
      await new Promise(r => setTimeout(r, 250));
    }
    setPlaying(false);
    setLineIdx(-1);
  }

  const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "12deg"] });

  return (
    <View style={[styles.reel, { backgroundColor: rhyme.bg }]}>
      <StarBurst visible={showStars} />

      {/* Big bouncing emoji — center of screen */}
      <TouchableOpacity onPress={handlePlay} activeOpacity={0.9} style={styles.emojiWrap}>
        <Animated.Text style={[styles.bigEmoji, {
          transform: [{ scale: bounceAnim }, { rotate }],
        }]}>
          {rhyme.emoji}
        </Animated.Text>
      </TouchableOpacity>

      {/* Title */}
      <Text style={[styles.reelTitle, { color: rhyme.color }]}>
        {lang === "hindi" ? rhyme.hindi : rhyme.title}
      </Text>

      {/* Lyrics — highlighted line */}
      <View style={[styles.lyricsBox, { borderColor: rhyme.color + "30", backgroundColor: "#FFF8" }]}>
        {lines.map((line, i) => (
          <Text key={i} style={[
            styles.lyricLine,
            { color: rhyme.color },
            lineIdx === i && styles.lyricActive,
          ]}>
            {lineIdx === i ? "▶ " : "   "}{line}
          </Text>
        ))}
      </View>

      {/* Play button */}
      <TouchableOpacity
        style={[styles.playBtn, { backgroundColor: rhyme.color }]}
        onPress={handlePlay}
        activeOpacity={0.85}
      >
        <Text style={styles.playBtnText}>
          {playing ? "⏹  Roko" : "▶  Sunao"}
        </Text>
      </TouchableOpacity>

      {/* Swipe hint */}
      <Text style={[styles.swipeHint, { color: rhyme.color + "80" }]}>
        ↕  Swipe for next rhyme
      </Text>
    </View>
  );
}

// ── Main ─────────────────────────────────────────────────────────
export default function BabyHome() {
  const { theme } = useAgeTheme();
  const activeChild = useChildStore((s) => s.activeChild);
  const lang = activeChild?.preferred_language === "english" ? "english" : "hindi";
  const [currentIdx, setCurrentIdx] = useState(0);
  const flatRef = useRef<FlatList>(null);

  const onScroll = useCallback((e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.y / height);
    setCurrentIdx(idx);
  }, []);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      {/* Top bar */}
      <SafeAreaView style={styles.topBar} pointerEvents="box-none">
        <View style={[styles.worldPill, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.worldText}>{theme.emoji} {theme.label}</Text>
        </View>
        <Text style={styles.childName}>
          {activeChild?.avatar_emoji} {activeChild?.name}
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/parent/dashboard")}
          style={[styles.parentBtn, { backgroundColor: theme.colors.primary + "20" }]}
        >
          <Text style={{ fontSize: 20 }}>👪</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Vertical Reel */}
      <FlatList
        ref={flatRef}
        data={RHYMES}
        keyExtractor={(r) => r.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        decelerationRate="fast"
        onMomentumScrollEnd={onScroll}
        renderItem={({ item, index }) => (
          <RhymeReel
            rhyme={item}
            isActive={index === currentIdx}
            lang={lang}
          />
        )}
      />

      {/* Right side dots */}
      <View style={styles.dots} pointerEvents="none">
        {RHYMES.map((_, i) => (
          <View key={i} style={[
            styles.dot,
            { backgroundColor: i === currentIdx ? theme.colors.primary : theme.colors.primary + "30" },
          ]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FFF" },

  topBar: {
    position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 8,
  },
  worldPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  worldText: { color: "#FFF", fontWeight: "800", fontSize: 13 },
  childName: { fontSize: 15, fontWeight: "700", color: "#1C1917" },
  parentBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },

  // Reel
  reel: {
    width, height,
    alignItems: "center",
    justifyContent: "center",
    gap: 16, paddingHorizontal: 24,
    paddingTop: 80, paddingBottom: 40,
  },
  emojiWrap: { alignItems: "center", justifyContent: "center" },
  bigEmoji:  { fontSize: 120 },
  reelTitle: { fontSize: 24, fontWeight: "900", textAlign: "center" },

  lyricsBox: {
    width: "100%", borderRadius: 20,
    padding: 16, gap: 8, borderWidth: 1.5,
  },
  lyricLine: {
    fontSize: 14, fontWeight: "500",
    textAlign: "left", opacity: 0.4, lineHeight: 22,
  },
  lyricActive: {
    fontSize: 17, fontWeight: "900", opacity: 1,
  },

  playBtn: {
    paddingHorizontal: 40, paddingVertical: 16,
    borderRadius: 24,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 5,
  },
  playBtnText: { color: "#FFF", fontSize: 20, fontWeight: "900" },

  swipeHint: { fontSize: 13, fontWeight: "600" },

  dots: {
    position: "absolute", right: 10, top: "50%",
    transform: [{ translateY: -50 }], gap: 6,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
});
