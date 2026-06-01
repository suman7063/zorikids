import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, Dimensions,
  FlatList, TouchableOpacity, Animated, StatusBar, Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useVideoPlayer, VideoView } from "expo-video";
import { supabase } from "../../src/lib/supabase";

const { width, height } = Dimensions.get("window");

const LETTER_COLORS = [
  "#FF6B6B","#FF9A3C","#FFD93D","#6BCB77","#4D96FF",
  "#FF6FC8","#A855F7","#06B6D4","#F59E0B","#10B981",
  "#EF4444","#8B5CF6","#EC4899","#14B8A6","#F97316",
  "#84CC16","#06B6D4","#3B82F6","#A855F7","#F43F5E",
  "#10B981","#FBBF24","#6366F1","#E11D48","#0EA5E9","#22C55E",
];

type Alphabet = {
  id: string; letter: string; word: string;
  image_url: string | null; video_url: string | null; is_published: boolean;
};

const TAB_BAR_H = 64; // _layout.tsx mein height: 80, paddingBottom: 16

// ── Single Reel Card ─────────────────────────────────────
function AlphabetReel({ item, isActive, index, reelHeight, onVideoEnd }: {
  item: Alphabet; isActive: boolean; index: number; reelHeight: number;
  onVideoEnd: () => void;
}) {
  const color         = LETTER_COLORS[index % LETTER_COLORS.length];
  const [playing, setPlaying] = useState(false);
  const autoTimer     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onVideoEndRef = useRef(onVideoEnd);

  // Always keep ref current
  useEffect(() => { onVideoEndRef.current = onVideoEnd; }, [onVideoEnd]);

  const player = useVideoPlayer(
    item.video_url ? { uri: item.video_url } : null,
    (p) => { p.muted = false; p.loop = false; }
  );

  function startVideo() {
    if (!item.video_url || !player) {
      setTimeout(() => onVideoEndRef.current?.(), 5000);
      return;
    }
    setPlaying(true);
    player.play();
    const sub = player.addListener("playToEnd", () => {
      sub.remove();
      setPlaying(false);

      // Video 0 par reset karo — dobara play kar sake
      try { player.currentTime = 0; } catch {}

      // 5 sec baad next scroll
      setTimeout(() => onVideoEndRef.current?.(), 5000);
    });
  }

  useEffect(() => {
    if (isActive) {
      // 10 sec wait → auto play
      autoTimer.current = setTimeout(startVideo, 10000);
    } else {
      // Clear timer + stop video
      if (autoTimer.current) clearTimeout(autoTimer.current);
      if (player) { try { player.pause(); } catch {} }
      setPlaying(false);
    }
    return () => { if (autoTimer.current) clearTimeout(autoTimer.current); };
  }, [isActive]);

  function handleTap() {
    // Cancel auto timer — user tapped manually
    if (autoTimer.current) clearTimeout(autoTimer.current);
    startVideo();
  }

  return (
    <TouchableOpacity
      style={[styles.reel, { backgroundColor: color, height: reelHeight }]}
      onPress={handleTap}
      activeOpacity={1}
    >
      {/* Image — hamesha background mein */}
      {item.image_url && (
        <Image
          source={{ uri: item.image_url }}
          style={[styles.reelImg, StyleSheet.absoluteFill]}
          resizeMode="cover"
        />
      )}

      {/* Video — image ke upar, sirf jab playing ho */}
      {item.video_url && playing && (
        <VideoView
          player={player}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          nativeControls={false}
        />
      )}


    </TouchableOpacity>
  );
}

// ── Main ─────────────────────────────────────────────────
export default function AlphabetsScreen() {
  const insets      = useSafeAreaInsets();
  const reelHeight  = height - TAB_BAR_H;

  const [alphabets, setAlphabets] = useState<Alphabet[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const currentIdxRef = useRef(0);
  const alphabetsRef  = useRef<Alphabet[]>([]);
  const flatRef = useRef<FlatList>(null);

  useEffect(() => {
    supabase
      .from("alphabets").select("*")
      .eq("is_published", true).order("letter")
      .then(({ data }) => {
        const list = data ?? [];
        setAlphabets(list);
        alphabetsRef.current = list;
      });
  }, []);

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const idx = viewableItems[0].index ?? 0;
      currentIdxRef.current = idx;
      setCurrentIdx(idx);
    }
  }, []);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current;

  // useCallback + ref — no stale closure
  const scrollToNext = useCallback(() => {
    const next = currentIdxRef.current + 1;
    if (next < alphabetsRef.current.length) {
      flatRef.current?.scrollToIndex({ index: next, animated: true });
      currentIdxRef.current = next;
      setCurrentIdx(next);
    }
  }, []);

  if (alphabets.length === 0) {
    return (
      <View style={styles.empty}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.emptyEmoji}>🔤</Text>
        <Text style={styles.emptyText}>Loading A B C...</Text>
      </View>
    );
  }

  return (
    <View style={{ height: reelHeight, backgroundColor: "#000", overflow: "hidden" }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <FlatList
        ref={flatRef}
        data={alphabets}
        keyExtractor={(a) => a.id}
        showsVerticalScrollIndicator={false}
        snapToInterval={reelHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        getItemLayout={(_, i) => ({ length: reelHeight, offset: reelHeight * i, index: i })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        style={{ height: reelHeight }}
        renderItem={({ item, index }) => (
          <AlphabetReel
            item={item}
            isActive={index === currentIdx}
            index={index}
            reelHeight={reelHeight}
            onVideoEnd={scrollToNext}
          />
        )}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  reel: { width, height, justifyContent: "center", alignItems: "center", overflow: "hidden" },
  reelImg: { width, height: "100%" },

  overlay: { backgroundColor: "rgba(0,0,0,0.35)" },
  hidden:  { opacity: 0 },

  content: { alignItems: "center", gap: 20, zIndex: 1 },

  bigLetter: {
    fontSize: 180, fontWeight: "900", color: "#FFF",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 12,
    lineHeight: 200,
  },

  wordPhrase: {
    fontSize: 26, fontWeight: "600", color: "#FFF",
    textAlign: "center", lineHeight: 38,
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  wordName: { fontSize: 40, fontWeight: "900" },

  playHint: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24,
    marginTop: 8,
  },
  playIcon: { color: "#FFF", fontSize: 16 },
  playText: { color: "#FFF", fontWeight: "700", fontSize: 15 },

  swipeHint: {
    position: "absolute", bottom: 40,
    color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: "600",
  },

  // Top bar
  topBar: {
    position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
    paddingHorizontal: 24, paddingTop: 8,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  topTitle:   { color: "#FFF", fontSize: 20, fontWeight: "900", letterSpacing: 6 },
  topCounter: { color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: "700" },

  // Dots
  dots: {
    position: "absolute", right: 12, top: "50%",
    transform: [{ translateY: -50 }], gap: 6, alignItems: "center",
  },
  dot: { width: 6, height: 6, borderRadius: 3 },

  // Empty
  empty: { flex: 1, backgroundColor: "#1C1917", alignItems: "center", justifyContent: "center", gap: 16 },
  emptyEmoji: { fontSize: 64 },
  emptyText:  { color: "#FFF", fontSize: 20, fontWeight: "700" },
});
