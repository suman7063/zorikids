import "../global.css";
import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { supabase } from "../src/lib/supabase";
import { useAuthStore } from "../src/stores/authStore";
import { useSettingsStore } from "../src/stores/settingsStore";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1 } },
});

export default function RootLayout() {
  const setSession = useAuthStore((s) => s.setSession);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const isDark = useSettingsStore((s) => s.isDarkMode);

  useEffect(() => {
    loadSettings();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user.id) fetchProfile(session.user.id);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user.id) fetchProfile(session.user.id);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style={isDark ? "light" : "dark"} />
          <Stack screenOptions={{ headerShown: false, animation: "fade_from_bottom" }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="auth" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="activity"
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="parent"
              options={{ animation: "slide_from_bottom", presentation: "modal" }}
            />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
