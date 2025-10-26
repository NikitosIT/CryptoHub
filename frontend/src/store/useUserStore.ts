import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

interface UserState {
    user: User | null;
    nickname: string | null;
    email: string;
    setUser: (user: User | null) => void;
    setEmail: (email: string) => void;
    setNickname: (nickname: string | null) => void;
    logout: () => Promise<void>;
    loadProfile: () => Promise<void>;
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            user: null,
            nickname: null,
            email: "",
            setUser: (user) => set({ user }),
            setEmail: (email) => set({ email }),
            setNickname: (nickname) => set({ nickname }),

            loadProfile: async () => {
                const user = get().user;
                if (!user) return;
                const { data, error } = await supabase
                    .from("profiles")
                    .select("nickname")
                    .eq("id", user.id)
                    .maybeSingle();

                if (!error && data?.nickname) set({ nickname: data.nickname });
            },

            logout: async () => {
                await supabase.auth.signOut();
                set({ user: null, email: "", nickname: null });
            },
        }),
        {
            name: "nickname-storage",
            partialize: (state) => ({
                nickname: state.nickname,
            }),
        },
    ),
);
