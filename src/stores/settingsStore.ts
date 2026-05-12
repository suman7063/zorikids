import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ParentSettings } from "../types";

interface SettingsState {
  settings: ParentSettings | null;
  isDarkMode: boolean;
  isEyeProtection: boolean;
  sessionStartTime: number | null;
  screenMinutesUsed: number;
  toggleDarkMode: () => void;
  toggleEyeProtection: () => void;
  setSettings: (s: ParentSettings) => void;
  startSession: () => void;
  endSession: () => number;
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  isDarkMode: false,
  isEyeProtection: false,
  sessionStartTime: null,
  screenMinutesUsed: 0,

  toggleDarkMode: () =>
    set((s) => {
      const next = !s.isDarkMode;
      AsyncStorage.setItem("dark_mode", String(next));
      return { isDarkMode: next };
    }),

  toggleEyeProtection: () =>
    set((s) => {
      const next = !s.isEyeProtection;
      AsyncStorage.setItem("eye_protection", String(next));
      return { isEyeProtection: next };
    }),

  setSettings: (settings) => set({ settings }),

  startSession: () => set({ sessionStartTime: Date.now() }),

  endSession: () => {
    const { sessionStartTime } = get();
    if (!sessionStartTime) return 0;
    const minutes = Math.floor((Date.now() - sessionStartTime) / 60000);
    set((s) => ({
      sessionStartTime: null,
      screenMinutesUsed: s.screenMinutesUsed + minutes,
    }));
    return minutes;
  },

  loadSettings: async () => {
    const dark = await AsyncStorage.getItem("dark_mode");
    const eye = await AsyncStorage.getItem("eye_protection");
    set({
      isDarkMode: dark === "true",
      isEyeProtection: eye === "true",
    });
  },

  saveSettings: async () => {
    const { isDarkMode, isEyeProtection } = get();
    await AsyncStorage.setItem("dark_mode", String(isDarkMode));
    await AsyncStorage.setItem("eye_protection", String(isEyeProtection));
  },
}));
