import React, { useRef, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, Dimensions, FlatList,
  TouchableOpacity, Animated, StatusBar,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import YoutubePlayer from "react-native-youtube-iframe";
import { useAgeContent, type RhymeVideo } from "../../src/hooks/useAgeContent";
import { useChildStore } from "../../src/stores/childStore";

const { width, height } = Dimensions.get("window");

// ── Quiz data per video ──────────────────────────────────────────
const VIDEO_QUIZZES: Record<string, Array<{ q: string; emoji: string; options: string[]; correct: number }>> = {
  i35AUg11hvo: [{ q: "हाथी के कितने पैर होते हैं?", emoji: "🐘", options: ["2", "4", "6"], correct: 1 }],
  P2r7LoytBfo: [{ q: "लकड़ी की काठी किसकी है?", emoji: "🏇", options: ["घोड़े की", "हाथी की", "गाय की"], correct: 0 }],
  "90g8cLhvomE": [{ q: "Twinkle Twinkle — star is like a?", emoji: "⭐", options: ["Diamond", "Moon", "Sun"], correct: 0 }],
  MIZbUhVNzRs: [{ q: "Baa Baa Black Sheep — how many bags?", emoji: "🐑", options: ["1", "2", "3"], correct: 2 }],
  "_gvJCXdxvIY": [{ q: "Wheels on the bus go...", emoji: "🚌", options: ["Up & Down", "Round & Round", "Side to Side"], correct: 1 }],
  "acRSa-5C3Nk": [{ q: "Old MacDonald had a...", emoji: "🐄", options: ["Farm", "Zoo", "Shop"], correct: 0 }],
};

// ── Single Video Card ────────────────────────────────────────────
function VideoCard({
  video, isActive, onVideoEnd, showQuiz, quizOptions, world, theme,
}: {
  video: RhymeVideo;
  isActive: boolean;
  onVideoEnd: (videoId: string) => void;
  showQuiz: boolean;
  quizOptions: number;
  world: string;
  theme: any;
}) {
  const [playing, setPlaying]     = useState(false);
  const [ended, setEnded]         = useState(false);
  const [showQ, setShowQ]         = useState(false);
  const [selected, setSelected]   = useState<number | null>(null);
  const [correct, setCorrect]     = useState(false);
  const addXP = useChildStore((s) => s.addXP);

  const primary = theme.colors.primary;
  const quiz    = VIDEO_QUIZZES[video.youtube_id];
  const q       = quiz?.[0];

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onStateChange = useCallback((state: string) => {
    if (state === "playing") setPlaying(true);
    if (state === "ended") {
      setEnded(true);
      setPlaying(false);
      if (showQuiz && q) {
        setTimeout(() => setShowQ(true), 600);
      } else {
        onVideoEnd(video.id);
      }
    }
  }, [showQuiz, q]);

  function handleAnswer(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    const isCorrect = idx === q.correct;
    setCorrect(isCorrect);
    if (isCorrect) addXP(video.xp_reward);

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.06, duration: 150, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1,    duration: 150, useNativeDriver: true }),
    ]).start();

    setTimeout(() => onVideoEnd(video.id), 1800);
  }

  const options = q?.options.slice(0, quizOptions) ?? [];

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.background }]}>

      {/* ── Video Player ── */}
      <View style={styles.playerWrap}>
        <YoutubePlayer
          height={width * 0.56}
          width={width}
          videoId={video.youtube_id}
          play={isActive && !ended}
          onChangeState={onStateChange}
          webViewStyle={{ opacity: 0.99 }}
          initialPlayerParams={{ controls: false, modestbranding: true, rel: false }}
        />

        {/* Overlay when not playing */}
        {!playing && !ended && (
          <TouchableOpacity
            style={[styles.playOverlay, { backgroundColor: primary + "CC" }]}
            onPress={() => setPlaying(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.playIcon}>▶</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Video Info ── */}
      <View style={styles.info}>
        <Text style={styles.videoEmoji}>{video.thumbnail_emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.videoTitle, { color: theme.colors.text }]}>
            {video.title_hindi || video.title}
          </Text>
          <View style={styles.metaRow}>
            <View style={[styles.xpBadge, { backgroundColor: primary + "20" }]}>
              <Text style={[styles.xpText, { color: primary }]}>+{video.xp_reward} XP</Text>
            </View>
            <Text style={[styles.duration, { color: theme.colors.textMuted }]}>
              {Math.floor(video.duration_seconds / 60)}:{String(video.duration_seconds % 60).padStart(2, "0")} min
            </Text>
          </View>
        </View>
      </View>

      {/* ── Quiz Popup ── */}
      {showQ && q && (
        <Animated.View style={[styles.quizCard, { backgroundColor: "#FFF", transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.quizEmoji}>{q.emoji}</Text>
          <Text style={styles.quizQ}>{q.q}</Text>

          <View style={styles.optionsWrap}>
            {options.map((opt, i) => {
              let bg = "#F3F4F6";
              let textColor = "#1C1917";
              if (selected !== null) {
                if (i === q.correct)          { bg = "#DCFCE7"; textColor = "#166534"; }
                else if (i === selected)      { bg = "#FEE2E2"; textColor = "#991B1B"; }
              }
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.optionBtn, { backgroundColor: bg }]}
                  onPress={() => handleAnswer(i)}
                  activeOpacity={selected !== null ? 1 : 0.8}
                >
                  <Text style={[styles.optionText, { color: textColor }]}>{opt}</Text>
                  {selected !== null && i === q.correct && <Text>✅</Text>}
                  {selected !== null && i === selected && i !== q.correct && <Text>❌</Text>}
                </TouchableOpacity>
              );
            })}
          </View>

          {selected !== null && (
            <Text style={[styles.resultText, { color: correct ? "#166534" : "#991B1B" }]}>
              {correct ? `🎉 शाबाश! +${video.xp_reward} XP` : "💪 Koi baat nahi!"}
            </Text>
          )}
        </Animated.View>
      )}

      {/* Baby world — just big emoji tap when ended */}
      {ended && !showQuiz && world === "baby" && (
        <View style={styles.babyEnd}>
          <Text style={{ fontSize: 64 }}>🎉</Text>
          <Text style={[styles.babyBravo, { color: primary }]}>शाबाश!</Text>
          <Text style={{ fontSize: 32 }}>⭐⭐⭐</Text>
        </View>
      )}

      {/* Swipe hint */}
      {!showQ && !ended && (
        <View style={styles.swipeHint}>
          <Text style={{ color: theme.colors.textMuted, fontSize: 12, fontWeight: "600" }}>
            ↕ Swipe for next video
          </Text>
        </View>
      )}
    </View>
  );
}

// ── Main Feed Screen ─────────────────────────────────────────────
export default function FeedScreen() {
  const { videos, loading, showQuiz, quizOptions, world, theme } = useAgeContent();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);

  function handleVideoEnd(_videoId: string) {
    const next = currentIndex + 1;
    if (next < videos.length) {
      flatRef.current?.scrollToIndex({ index: next, animated: true });
      setCurrentIndex(next);
    } else {
      // All videos done — go back
      router.back();
    }
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <Text style={{ fontSize: 48 }}>{theme.mascot}</Text>
        <Text style={{ color: theme.colors.primary, fontWeight: "700", marginTop: 12 }}>Loading...</Text>
      </View>
    );
  }

  if (videos.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <Text style={{ fontSize: 48 }}>😢</Text>
        <Text style={{ color: theme.colors.text, fontWeight: "700", marginTop: 12 }}>
          Koi video nahi mili!
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: theme.colors.primary, fontWeight: "700" }}>← Wapas jao</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: "#000" }]}>
      <StatusBar barStyle="light-content" />

      {/* Back button */}
      <SafeAreaView style={styles.topBar} pointerEvents="box-none">
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>✕</Text>
        </TouchableOpacity>
        <View style={[styles.worldPill, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.worldPillText}>{theme.emoji} {theme.label}</Text>
        </View>
        <Text style={styles.counter}>{currentIndex + 1}/{videos.length}</Text>
      </SafeAreaView>

      <FlatList
        ref={flatRef}
        data={videos}
        keyExtractor={(v) => v.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        decelerationRate="fast"
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.y / height);
          setCurrentIndex(idx);
        }}
        renderItem={({ item, index }) => (
          <VideoCard
            video={item}
            isActive={index === currentIndex}
            onVideoEnd={handleVideoEnd}
            showQuiz={showQuiz && item.has_quiz}
            quizOptions={quizOptions}
            world={world}
            theme={theme}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  topBar: {
    position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 8,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center", justifyContent: "center",
  },
  backIcon: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  worldPill: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
  },
  worldPillText: { color: "#FFF", fontWeight: "700", fontSize: 13 },
  counter: { color: "#FFF", fontWeight: "700", fontSize: 14 },

  // Card
  card: { width, height, justifyContent: "center" },

  playerWrap: { position: "relative" },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center", justifyContent: "center",
  },
  playIcon: { fontSize: 52, color: "#FFF" },

  info: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 16, gap: 12,
  },
  videoEmoji: { fontSize: 44 },
  videoTitle: { fontSize: 20, fontWeight: "800", lineHeight: 26 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 6 },
  xpBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  xpText:  { fontSize: 13, fontWeight: "700" },
  duration: { fontSize: 13 },

  // Quiz
  quizCard: {
    marginHorizontal: 20, borderRadius: 24, padding: 20,
    alignItems: "center", gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 16, elevation: 8,
  },
  quizEmoji: { fontSize: 48 },
  quizQ:    { fontSize: 18, fontWeight: "800", textAlign: "center", color: "#1C1917" },
  optionsWrap: { width: "100%", gap: 10 },
  optionBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14,
  },
  optionText: { fontSize: 16, fontWeight: "700" },
  resultText: { fontSize: 18, fontWeight: "800", marginTop: 4 },

  // Baby world end screen
  babyEnd: { alignItems: "center", gap: 12, paddingTop: 20 },
  babyBravo: { fontSize: 32, fontWeight: "900" },

  swipeHint: { alignItems: "center", paddingBottom: 16, paddingTop: 8 },
});
