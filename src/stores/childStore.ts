import { create } from "zustand";
import { supabase } from "../lib/supabase";
import type { Child, Streak } from "../types";

interface ChildState {
  children: Child[];
  activeChild: Child | null;
  streak: Streak | null;
  totalXP: number;
  setActiveChild: (child: Child) => void;
  fetchChildren: (parentId: string) => Promise<void>;
  fetchStreak: (childId: string) => Promise<void>;
  fetchTotalXP: (childId: string) => Promise<void>;
  addXP: (amount: number) => void;
}

export const useChildStore = create<ChildState>((set, get) => ({
  children: [],
  activeChild: null,
  streak: null,
  totalXP: 0,

  setActiveChild: (child) => set({ activeChild: child }),

  fetchChildren: async (parentId) => {
    const { data } = await supabase
      .from("children")
      .select("*")
      .eq("parent_id", parentId)
      .order("created_at");
    if (data) {
      set({ children: data });
      if (data.length > 0 && !get().activeChild) {
        set({ activeChild: data[0] });
      }
    }
  },

  fetchStreak: async (childId) => {
    const { data } = await supabase
      .from("streaks")
      .select("*")
      .eq("child_id", childId)
      .single();
    if (data) set({ streak: data });
  },

  fetchTotalXP: async (childId) => {
    const { data } = await supabase
      .from("child_progress")
      .select("xp_earned")
      .eq("child_id", childId)
      .eq("completed", true);
    if (data) {
      const total = data.reduce((sum, row) => sum + (row.xp_earned || 0), 0);
      set({ totalXP: total });
    }
  },

  addXP: (amount) => set((state) => ({ totalXP: state.totalXP + amount })),
}));
