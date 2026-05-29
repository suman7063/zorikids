import { useAudioPlayer } from "expo-audio";
import * as Speech from "expo-speech";

// Local MP3 files — assets/sounds/ folder se
const SOUND_FILES: Record<string, any> = {
  cat:      require("../../assets/sounds/cat.mp3"),
  dog:      require("../../assets/sounds/dog.mp3"),
  cow:      require("../../assets/sounds/cow.mp3"),
  lion:     require("../../assets/sounds/lion.mp3"),
  elephant: require("../../assets/sounds/elephant.mp3"),
  frog:     require("../../assets/sounds/frog.mp3"),
  pig:      require("../../assets/sounds/pig.mp3"),
  duck:     require("../../assets/sounds/duck.mp3"),
  horse:    require("../../assets/sounds/horse.mp3"),
  chick:    require("../../assets/sounds/chick.mp3"),
};

export const ANIMAL_META: Record<string, {
  nameHi:    string;
  nameEn:    string;
  soundWord: string;
}> = {
  elephant: { nameHi: "हाथी",   nameEn: "Elephant", soundWord: "Paon Paon! 🎺" },
  lion:     { nameHi: "शेर",    nameEn: "Lion",      soundWord: "Roaar! 😤"     },
  cow:      { nameHi: "गाय",    nameEn: "Cow",       soundWord: "Moooo! 🐄"     },
  dog:      { nameHi: "कुत्ता", nameEn: "Dog",       soundWord: "Woof Woof! 🐕" },
  cat:      { nameHi: "बिल्ली", nameEn: "Cat",       soundWord: "Meow! 🐱"      },
  frog:     { nameHi: "मेंढक",  nameEn: "Frog",      soundWord: "Ribbit! 🐸"    },
  duck:     { nameHi: "बतख",    nameEn: "Duck",       soundWord: "Quack! 🦆"    },
  pig:      { nameHi: "सूअर",   nameEn: "Pig",        soundWord: "Oink! 🐷"     },
  horse:    { nameHi: "घोड़ा",  nameEn: "Horse",      soundWord: "Neigh! 🐴"    },
  chick:    { nameHi: "चूजा",   nameEn: "Chick",      soundWord: "Cheep! 🐥"    },
};

// Standalone play function — hooks ke bahar use ho
import { Audio } from "expo-av";

let currentSound: Audio.Sound | null = null;

export async function playAnimalSound(
  key: string,
  lang: "hindi" | "english" | "both"
): Promise<void> {
  const meta = ANIMAL_META[key];
  const file = SOUND_FILES[key];
  if (!meta) return;

  Speech.stop();

  // Step 1: Introduction sentence
  const sentence = lang === "english"
    ? `This is a ${meta.nameEn}. Listen to its sound.`
    : `यह एक ${meta.nameHi} है। इसकी आवाज़ सुनो।`;

  await new Promise<void>((resolve) => {
    Speech.speak(sentence, {
      language: lang === "english" ? "en-IN" : "hi-IN",
      rate: 0.85,
      onDone: resolve,
      onStopped: resolve,
      onError: resolve,
    });
  });

  // Step 2: Actual animal sound
  try {
    if (currentSound) {
      await currentSound.stopAsync().catch(() => {});
      await currentSound.unloadAsync().catch(() => {});
      currentSound = null;
    }
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    const { sound } = await Audio.Sound.createAsync(file, { shouldPlay: true, volume: 1.0 });
    currentSound = sound;

    // Wait for sound to finish
    await new Promise<void>((resolve) => {
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync().catch(() => {});
          currentSound = null;
          resolve();
        }
      });
    });
  } catch {
    // MP3 missing — speech was enough
  }
}
