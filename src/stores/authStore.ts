import { create } from "zustand";
import { supabase } from "../lib/supabase";
import type { UserProfile } from "../types";

interface AuthState {
  user: UserProfile | null;
  session: any | null;
  loading: boolean;
  setSession: (session: any) => void;
  setUser: (user: UserProfile | null) => void;
  signOut: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  setSession: (session) => set({ session, loading: false }),
  setUser: (user) => set({ user }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },
  fetchProfile: async (userId) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (data) set({ user: data });
  },
}));
