import React, { useState, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Dimensions, Animated, Modal, Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAgeTheme } from "../../src/hooks/useAgeTheme";
import { useChildStore } from "../../src/stores/childStore";
import { playAnimalSound, ANIMAL_META } from "../../src/lib/animalSounds";

const { width } = Dimensions.get("window");
const CARD = (width - 56) / 3;

const IMGS: Record<string, any> = {
  cat:      require("../../assets/images/animals/cat.png"),
  chick:    require("../../assets/images/animals/chick.png"),
  cow:      require("../../assets/images/animals/cow.png"),
  dog:      require("../../assets/images/animals/dog.png"),
  elephant: require("../../assets/images/animals/elephant.png"),
  frog:     require("../../assets/images/animals/frog.png"),
  horse:    require("../../assets/images/animals/horse.png"),
  lion:     require("../../assets/images/animals/lion.png"),
  pig:      require("../../assets/images/animals/pig.png"),
};

const ANIMALS = [
  { key: "elephant", emoji: "🐘", bg: "#E0F2FE", accent: "#0284C7" },
  { key: "lion",     emoji: "🦁", bg: "#FEF9C3", accent: "#CA8A04" },
  { key: "cow",      emoji: "🐮", bg: "#DCFCE7", accent: "#16A34A" },
  { key: "dog",      emoji: "🐶", bg: "#FFF7ED", accent: "#EA580C" },
  { key: "cat",      emoji: "🐱", bg: "#F5F3FF", accent: "#7C3AED" },
  { key: "frog",     emoji: "🐸", bg: "#ECFDF5", accent: "#059669" },
  { key: "duck",     emoji: "🦆", bg: "#EFF6FF", accent: "#2563EB" },
  { key: "pig",      emoji: "🐷", bg: "#FFF0F6", accent: "#DB2777" },
  { key: "horse",    emoji: "🐴", bg: "#FFF7ED", accent: "#B45309" },
  { key: "chick",    emoji: "🐥", bg: "#FEFCE8", accent: "#D97706" },
];

function AnimalModal({ animal, visible, lang, onClose }: {
  animal: typeof ANIMALS[0] | null;
  visible: boolean;
  lang: "hindi" | "english" | "both";
  onClose: () => void;
}) {
  const meta      = animal ? ANIMAL_META[animal.key] : null;
  const cardAnim  = useRef(new Animated.Value(0)).current;
  const imgAnim   = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (visible && animal && meta) {
      cardAnim.setValue(0);
      imgAnim.setValue(1);

      Animated.spring(cardAnim, { toValue: 1, bounciness: 14, speed: 10, useNativeDriver: true }).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(imgAnim, { toValue: 1.08, duration: 500, useNativeDriver: true }),
          Animated.timing(imgAnim, { toValue: 1.0,  duration: 500, useNativeDriver: true }),
        ])
      ).start();

      const langKey = lang === "both" ? "hindi" : lang;
      let alive = true;
      playAnimalSound(animal.key, langKey).then(() => {
        if (alive) setTimeout(onClose, 600);
      });
      return () => { alive = false; imgAnim.stopAnimation(); };
    }
  }, [visible, animal?.key]);

  if (!animal || !meta) return null;
  const name = lang === "english" ? meta.nameEn : meta.nameHi;
  const img  = IMGS[animal.key];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.overlay}>
        <Animated.View style={[styles.modalCard, { backgroundColor: animal.bg, transform: [{ scale: cardAnim }] }]}>

          <Animated.View style={[styles.modalImgWrap, { transform: [{ scale: imgAnim }] }]}>
            {img
              ? <Image source={img} style={styles.modalImg} resizeMode="contain" />
              : <Text style={styles.modalEmoji}>{animal.emoji}</Text>
            }
          </Animated.View>

          <View style={[styles.nameBar, { backgroundColor: animal.accent }]}>
            <Text style={styles.nameText}>{name}</Text>
          </View>

          <Text style={[styles.soundWord, { color: animal.accent }]}>{meta.soundWord}</Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

export default function AnimalsScreen() {
  const { theme } = useAgeTheme();
  const activeChild = useChildStore((s) => s.activeChild);
  const lang = (activeChild?.preferred_language ?? "hindi") as "hindi" | "english" | "both";
  const [selected, setSelected] = useState<typeof ANIMALS[0] | null>(null);

  const pressAnims = useRef(
    ANIMALS.reduce((acc, a) => { acc[a.key] = new Animated.Value(1); return acc; }, {} as Record<string, Animated.Value>)
  ).current;

  function handleTap(animal: typeof ANIMALS[0]) {
    Animated.sequence([
      Animated.spring(pressAnims[animal.key], { toValue: 0.88, bounciness: 0, useNativeDriver: true }),
      Animated.spring(pressAnims[animal.key], { toValue: 1,    bounciness: 18, useNativeDriver: true }),
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

        <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
          {ANIMALS.map((animal) => {
            const meta = ANIMAL_META[animal.key];
            const name = lang === "english" ? meta?.nameEn : meta?.nameHi;
            const img  = IMGS[animal.key];
            return (
              <TouchableOpacity key={animal.key} onPress={() => handleTap(animal)} activeOpacity={0.85}>
                <Animated.View style={[
                  styles.card,
                  { backgroundColor: animal.bg, shadowColor: animal.accent, transform: [{ scale: pressAnims[animal.key] }] },
                ]}>
                  {img
                    ? <Image source={img} style={styles.cardImg} resizeMode="contain" />
                    : <Text style={styles.cardEmoji}>{animal.emoji}</Text>
                  }
                  <View style={[styles.cardLabel, { backgroundColor: animal.accent }]}>
                    <Text style={styles.cardLabelText}>{name}</Text>
                  </View>
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

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
  cardImg:       { width: CARD, height: CARD },
  cardEmoji:     { fontSize: 56 },
  cardLabel:     { width: "100%", paddingVertical: 10, alignItems: "center", marginTop: 10 },
  cardLabelText: { color: "#FFF", fontWeight: "900", fontSize: 14 },
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
  modalImg:   { width: "100%", height: "100%" },
  modalEmoji: { fontSize: 120 },
  nameBar:    { width: "100%", paddingVertical: 18, alignItems: "center", marginTop: 4 },
  nameText:   { color: "#FFF", fontSize: 32, fontWeight: "900" },
  soundWord:  { fontSize: 22, fontWeight: "900", marginTop: 16 },
});
