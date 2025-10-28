import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

interface UserState {
    user: User | null;
    email: string | null;
    nickname: string | null;
    isProfileLoading: boolean;
    setUser: (user: User | null) => void;
    setEmail: (email: string | null) => void;
    setNickname: (nickname: string | null) => void;
    isEmailSent: boolean;
    setEmailSent: (value: boolean) => void;
    loadProfile: () => Promise<void>;
    logout: () => Promise<void>;
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            user: null,
            email: null,
            nickname: null,
            isProfileLoading: false,
            isEmailSent: false,
            setUser: (user) => set({ user }),
            setEmail: (email) => set({ email }),
            setNickname: (nickname) => set({ nickname }),
            setEmailSent: (value: boolean) => set({ isEmailSent: value }),
            loadProfile: async () => {
                const { user, isProfileLoading } = get();
                if (!user || isProfileLoading) return;

                set({ isProfileLoading: true });
                try {
                    const { data, error } = await supabase
                        .from("profiles")
                        .select("nickname")
                        .eq("id", user.id)
                        .maybeSingle();

                    if (error) throw error;
                    if (data?.nickname) set({ nickname: data.nickname });
                } catch (err) {
                    console.error("Ошибка при загрузке профиля:", err);
                } finally {
                    set({ isProfileLoading: false });
                }
            },

            logout: async () => {
                await supabase.auth.signOut();
                set({ user: null, email: null, nickname: null });
            },
        }),
        {
            name: "user-storage",
            partialize: (state) => ({
                nickname: state.nickname,
                isEmailSent: state.isEmailSent,
            }),
        },
    ),
);
