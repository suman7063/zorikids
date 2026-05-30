import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Dimensions, Animated, Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import { useAgeTheme } from "../../src/hooks/useAgeTheme";
import { useChildStore } from "../../src/stores/childStore";
import { supabase } from "../../src/lib/supabase";
import { playAnimalIntro, playAnimalMp3FromUrl } from "../../src/lib/animalSounds";

const MOUTH_OPEN_MS = 3000;
const { width } = Dimensions.get("window");
const CARD = (width - 56) / 3;

type Animal = {
  id: string;
  key: string;
  name_hi: string;
  name_en: string;
  sound_word: string;
  emoji: string;
  bg: string;
  accent: string;
  video_url: string | null;
  sound_url: string | null;
  is_published: boolean;
};

function AnimalModal({ animal, visible, lang, onClose }: {
  animal: Animal | null;
  visible: boolean;
  lang: "hindi" | "english" | "both";
  onClose: () => void;
}) {
  const hasVideo    = !!(animal?.video_url);
  const soundPlayed = useRef(false);
  const cardAnim    = useRef(new Animated.Value(0)).current;
  const imgAnim     = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible || !animal) return;
    soundPlayed.current = false;
    const langKey = lang === "both" ? "hindi" : lang;

    if (hasVideo) {
      playAnimalIntro(animal.key, animal.name_hi, animal.name_en, langKey);
      return;
    }

    // Image/emoji fallback — play intro + sound then close
    cardAnim.setValue(0);
    imgAnim.setValue(1);
    Animated.spring(cardAnim, { toValue: 1, bounciness: 14, speed: 10, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(imgAnim, { toValue: 1.08, duration: 500, useNativeDriver: true }),
        Animated.timing(imgAnim, { toValue: 1.0,  duration: 500, useNativeDriver: true }),
      ])
    ).start();

    let alive = true;
    playAnimalIntro(animal.key, animal.name_hi, animal.name_en, langKey);
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

  function handlePlaybackStatus(status: AVPlaybackStatus) {
    if (!status.isLoaded) return;
    if (status.didJustFinish) { onClose(); return; }
    if (!soundPlayed.current && status.positionMillis >= MOUTH_OPEN_MS && animal?.sound_url) {
      soundPlayed.current = true;
      playAnimalMp3FromUrl(animal.sound_url!);
    }
  }

  if (hasVideo) {
    return (
      <Modal visible={visible} transparent={false} animationType="fade" onRequestClose={onClose} statusBarTranslucent>
        <TouchableOpacity style={styles.fullScreen} activeOpacity={1} onPress={onClose}>
          <Video
            source={{ uri: animal.video_url! }}
            style={StyleSheet.absoluteFill}
            resizeMode={ResizeMode.COVER}
            shouldPlay={visible}
            isLooping={false}
            isMuted={true}
            onPlaybackStatusUpdate={handlePlaybackStatus}
          />
        </TouchableOpacity>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.overlay}>
        <Animated.View style={[styles.modalCard, { backgroundColor: animal.bg, transform: [{ scale: cardAnim }] }]}>
          <Animated.View style={[styles.modalImgWrap, { transform: [{ scale: imgAnim }] }]}>
            <Text style={styles.modalEmoji}>{animal.emoji}</Text>
          </Animated.View>
          <View style={[styles.nameBar, { backgroundColor: animal.accent }]}>
            <Text style={styles.nameText}>{langKey === "english" ? animal.name_en : animal.name_hi}</Text>
          </View>
          <Text style={[styles.soundWord, { color: animal.accent }]}>{animal.sound_word}</Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

export default function AnimalsScreen() {
  const { theme }    = useAgeTheme();
  const activeChild  = useChildStore((s) => s.activeChild);
  const lang         = (activeChild?.preferred_language ?? "hindi") as "hindi" | "english" | "both";
  const [animals, setAnimals]   = useState<Animal[]>([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState<Animal | null>(null);

  const pressAnims = useRef<Record<string, Animated.Value>>({}).current;

  useEffect(() => {
    supabase
      .from("animals")
      .select("*")
      .eq("is_published", true)
      .order("name_en")
      .then(({ data }) => {
        const list = data ?? [];
        list.forEach((a) => {
          if (!pressAnims[a.id]) pressAnims[a.id] = new Animated.Value(1);
        });
        setAnimals(list);
        setLoading(false);
      });
  }, []);

  function handleTap(animal: Animal) {
    if (!pressAnims[animal.id]) pressAnims[animal.id] = new Animated.Value(1);
    Animated.sequence([
      Animated.spring(pressAnims[animal.id], { toValue: 0.88, bounciness: 0, useNativeDriver: true }),
      Animated.spring(pressAnims[animal.id], { toValue: 1,    bounciness: 18, useNativeDriver: true }),
    ]).start();
    setSelected(animal);
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>🐾</Text>
          <View>
            <Text style={[styles.title, { color: theme.colors.primary }]}>Animals</Text>
            <Text style={styles.sub}>Tap to meet them!</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
            {animals.map((animal) => {
              if (!pressAnims[animal.id]) pressAnims[animal.id] = new Animated.Value(1);
              return (
                <TouchableOpacity key={animal.id} onPress={() => handleTap(animal)} activeOpacity={0.85}>
                  <Animated.View style={[
                    styles.card,
                    { backgroundColor: animal.bg, shadowColor: animal.accent, transform: [{ scale: pressAnims[animal.id] }] },
                  ]}>
                    <Text style={styles.cardEmoji}>{animal.emoji}</Text>
                    <View style={[styles.cardLabel, { backgroundColor: animal.accent }]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12,
  },
  headerEmoji: { fontSize: 44 },
  title: { fontSize: 28, fontWeight: "900" },
  sub:   { fontSize: 13, color: "#9CA3AF", fontWeight: "600" },
  grid: {
    flexDirection: "row", flexWrap: "wrap",
    gap: 14, paddingHorizontal: 14, paddingBottom: 32,
  },
  card: {
    width: CARD, borderRadius: 28, overflow: "hidden",
    alignItems: "center", paddingTop: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22, shadowRadius: 14, elevation: 8,
  },
  cardEmoji:     { fontSize: 56, marginBottom: 8 },
  cardLabel:     { width: "100%", paddingVertical: 10, alignItems: "center", marginTop: 4 },
  cardLabelText: { color: "#FFF", fontWeight: "900", fontSize: 14 },
  loadingWrap:   { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText:   { fontSize: 16, color: "#9CA3AF" },
  fullScreen:    { flex: 1, backgroundColor: "#000" },
  overlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center", justifyContent: "center",
  },
  modalCard: {
    width: width * 0.88, borderRadius: 36,
    alignItems: "center", paddingTop: 8, paddingBottom: 28,
    shadowColor: "#000", shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3, shadowRadius: 32, elevation: 20,
  },
  modalImgWrap: {
    width: width * 0.7, height: width * 0.7,
    alignItems: "center", justifyContent: "center",
  },
  modalEmoji: { fontSize: 120 },
  nameBar:    { width: "100%", paddingVertical: 18, alignItems: "center", marginTop: 4 },
  nameText:   { color: "#FFF", fontSize: 32, fontWeight: "900" },
  soundWord:  { fontSize: 22, fontWeight: "900", marginTop: 16 },
});
