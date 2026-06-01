import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Dimensions, Animated, Modal, Image, RefreshControl, StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useVideoPlayer, VideoView } from "expo-video";
import { useChildStore } from "../../src/stores/childStore";
import { supabase } from "../../src/lib/supabase";
import { playAnimalMp3FromUrl } from "../../src/lib/animalSounds";

const { width, height } = Dimensions.get("window");
const CARD = (width - 48) / 2;

type Animal = {
  id: string; key: string;
  name_hi: string; name_en: string;
  sound_word: string; emoji: string;
  image_url: string | null; video_url: string | null; sound_url: string | null;
  is_published: boolean;
};

const CARD_COLORS: Record<string, string> = {
  elephant: "#7EC8E3", lion: "#FFB347", cow: "#77DD77",
  dog: "#FFD700", cat: "#DDA0DD", frog: "#90EE90",
  duck: "#87CEEB", pig: "#FFB6C1", horse: "#F4A460",
  chick: "#FFEC8B", tiger: "#FF7F50", bear: "#DEB887",
  monkey: "#FFA07A", rabbit: "#FFB6C1",
};
const FALLBACK_COLORS = ["#FF6B6B","#FFD93D","#6BCB77","#4D96FF","#FF6FC8","#FF9A3C"];
function getCardColor(key: string, idx: number) {
  return CARD_COLORS[key] ?? FALLBACK_COLORS[idx % FALLBACK_COLORS.length];
}

// ── Modal ─────────────────────────────────────────────────────
function AnimalModal({ animal, visible, lang, onClose }: {
  animal: Animal | null; visible: boolean;
  lang: "hindi" | "english" | "both"; onClose: () => void;
}) {
  const hasVideo    = !!(animal?.video_url);
  const soundPlayed = useRef(false);
  const [videoReady, setVideoReady] = useState(false);
  const crossfade   = useRef(new Animated.Value(0)).current;
  const modalAnim   = useRef(new Animated.Value(0)).current;
  const cardAnim    = useRef(new Animated.Value(0)).current;
  const imgAnim     = useRef(new Animated.Value(1)).current;

  const player = useVideoPlayer(
    animal?.video_url ? { uri: animal.video_url } : null,
    (p) => { p.muted = false; p.loop = false; }
  );

  useEffect(() => {
    if (visible) {
      modalAnim.setValue(0);
      Animated.spring(modalAnim, { toValue: 1, bounciness: 0, speed: 14, useNativeDriver: true }).start();
    }
  }, [visible]);

  useEffect(() => {
    if (!player || !hasVideo || !visible) return;
    setVideoReady(false);

    // Seedha video play
    player.play();

    const statusSub = player.addListener("statusChange", ({ status }) => {
      if (status === "readyToPlay") setVideoReady(true);
    });

    // Video khatam → modal close
    const endSub = player.addListener("playToEnd", () => {
      setTimeout(onClose, 500);
    });

    return () => { statusSub.remove(); endSub.remove(); };
  }, [player, visible, animal?.key]);

  useEffect(() => {
    if (!visible || !animal) return;
    soundPlayed.current = false;
    setVideoReady(false);
    crossfade.setValue(0);

    if (hasVideo) return; // video wala useEffect handle karega

    cardAnim.setValue(0);
    imgAnim.setValue(1);
    Animated.spring(cardAnim, { toValue: 1, bounciness: 14, speed: 10, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(imgAnim, { toValue: 1.08, duration: 500, useNativeDriver: true }),
        Animated.timing(imgAnim, { toValue: 1.0,  duration: 500, useNativeDriver: true }),
      ])
    ).start();

    // No speech — sirf sound play karo
    let alive = true;
    if (animal.sound_url) {
      playAnimalMp3FromUrl(animal.sound_url).then(() => {
        if (alive) setTimeout(onClose, 600);
      });
    } else {
      setTimeout(() => { if (alive) onClose(); }, 3000);
    }
    return () => { alive = false; imgAnim.stopAnimation(); };
  }, [visible, animal?.key]);

  if (!animal) return null;
  const langKey = lang === "both" ? "hindi" : lang;

  if (hasVideo) {
    return (
      <Modal visible={visible} transparent={false} animationType="none" onRequestClose={onClose} statusBarTranslucent>
        <Animated.View style={[styles.fullScreen, { opacity: modalAnim }]}>
          <View style={styles.fullScreen}>
            {animal.image_url && !videoReady && (
              <Image
                source={{ uri: animal.image_url }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
            )}
            <VideoView
              player={player}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              nativeControls={false}
            />
          </View>
        </Animated.View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[styles.overlay, { opacity: modalAnim }]}>
        <Animated.View style={[styles.modalCard, { transform: [{ scale: cardAnim }] }]}>
          <Animated.View style={[styles.modalImgWrap, { transform: [{ scale: imgAnim }] }]}>
            {animal.image_url
              ? <Image source={{ uri: animal.image_url }} style={styles.modalImg} resizeMode="contain" />
              : <Text style={styles.modalEmoji}>{animal.emoji}</Text>
            }
          </Animated.View>
          <View style={styles.nameBar}>
            <Text style={styles.nameText}>{langKey === "english" ? animal.name_en : animal.name_hi}</Text>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ── Main ─────────────────────────────────────────────────────
export default function AnimalsScreen() {
  const activeChild  = useChildStore((s) => s.activeChild);
  const lang         = (activeChild?.preferred_language ?? "hindi") as "hindi" | "english" | "both";
  const [animals, setAnimals]       = useState<Animal[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected]     = useState<Animal | null>(null);
  const pressAnims = useRef<Record<string, Animated.Value>>({}).current;

  async function fetchAnimals(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    const { data } = await supabase
      .from("animals").select("*")
      .eq("is_published", true).order("name_en");
    const list = data ?? [];
    list.forEach((a) => { if (!pressAnims[a.id]) pressAnims[a.id] = new Animated.Value(1); });
    setAnimals(list);
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => { fetchAnimals(); }, []);

  function handleTap(animal: Animal) {
    if (!pressAnims[animal.id]) pressAnims[animal.id] = new Animated.Value(1);
    Animated.sequence([
      Animated.spring(pressAnims[animal.id], { toValue: 0.88, bounciness: 0, useNativeDriver: true }),
      Animated.spring(pressAnims[animal.id], { toValue: 1, bounciness: 18, useNativeDriver: true }),
    ]).start();
    setSelected(animal);
  }

  return (
    <LinearGradient
      colors={["#87CEEB", "#4FC3F7", "#81C784", "#4CAF50"]}
      start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
      style={styles.screen}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>🐘</Text>
          <View>
            <Text style={styles.title}>Animals</Text>
            <Text style={styles.sub}>Tap to meet them! 🌿</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <Text style={styles.loadingText}>🐾</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.grid}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchAnimals(true)} />}
          >
            {animals.map((animal, idx) => {
              if (!pressAnims[animal.id]) pressAnims[animal.id] = new Animated.Value(1);
              return (
                <TouchableOpacity key={animal.id} onPress={() => handleTap(animal)} activeOpacity={0.85}>
                  <Animated.View style={[
                    styles.card,
                    { backgroundColor: getCardColor(animal.key, idx), transform: [{ scale: pressAnims[animal.id] }] },
                  ]}>
                    {animal.image_url
                      ? <Image source={{ uri: animal.image_url }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                      : <View style={[StyleSheet.absoluteFill, { alignItems: "center", justifyContent: "center" }]}>
                          <Text style={styles.cardEmoji}>{animal.emoji}</Text>
                        </View>
                    }
                    <View style={styles.cardOverlay}>
                      <Text style={styles.cardLabelText}>
                        {lang === "english" ? animal.name_en : animal.name_hi}
                      </Text>
                    </View>
                  </Animated.View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        <AnimalModal
          animal={selected}
          visible={selected !== null}
          lang={lang}
          onClose={() => setSelected(null)}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen:  { flex: 1 },
  header:  {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12,
  },
  headerEmoji: { fontSize: 44 },
  title: {
    fontSize: 30, fontWeight: "900", color: "#FFF",
    textShadowColor: "rgba(0,0,0,0.2)", textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3,
  },
  sub:  { fontSize: 13, color: "#E8F5E9", fontWeight: "700" },
  grid: {
    flexDirection: "row", flexWrap: "wrap",
    gap: 14, paddingHorizontal: 14, paddingBottom: 32,
  },
  card: {
    width: CARD, height: CARD * 1.2, borderRadius: 24, overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 10,
    borderWidth: 3, borderColor: "#FFF",
  },
  cardEmoji:   { fontSize: 56 },
  cardOverlay: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingVertical: 12, paddingHorizontal: 8,
    backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center",
  },
  cardLabelText: { color: "#FFF", fontWeight: "900", fontSize: 20, letterSpacing: 0.5 },
  loadingWrap:   { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText:   { fontSize: 60 },
  fullScreen:    { flex: 1, backgroundColor: "#000" },
  overlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center", justifyContent: "center",
  },
  modalCard: {
    width: width * 0.88, borderRadius: 36, overflow: "hidden",
    alignItems: "center", paddingBottom: 28,
    backgroundColor: "#FFF",
    shadowColor: "#000", shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3, shadowRadius: 32, elevation: 20,
  },
  modalImgWrap: { width: width * 0.88, height: width * 0.88 },
  modalImg:     { width: "100%", height: "100%" },
  modalEmoji:   { fontSize: 120 },
  nameBar:      { width: "100%", paddingVertical: 18, alignItems: "center", backgroundColor: "#FFF" },
  nameText:     { color: "#1C1917", fontSize: 32, fontWeight: "900" },
});
