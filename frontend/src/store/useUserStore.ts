import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

interface UserState {
    user: User | null;
    email: string | null;
    nickname: string | null;
    isProfileLoading: boolean;
    isEmailSent: boolean;
    profile_logo: string | null;
    setUser: (user: User | null) => void;
    setEmail: (email: string | null) => void;
    setNickname: (nickname: string | null) => void;
    setProfileLogo: (url: string | null) => void;
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
            profile_logo: null,
            setUser: (user) => set({ user }),
            setEmail: (email) => set({ email }),
            setNickname: (nickname) => set({ nickname }),
            setEmailSent: (value: boolean) => set({ isEmailSent: value }),
            setProfileLogo: (url) => set({ profile_logo: url }),
            loadProfile: async () => {
                const { user, isProfileLoading } = get();
                if (!user || isProfileLoading) return;

                set({ isProfileLoading: true });
                try {
                    const { data, error } = await supabase
                        .from("profiles")
                        .select("nickname, profile_logo")
                        .eq("id", user.id)
                        .maybeSingle();

                    if (error) throw error;
                    if (data) {
                        set({
                            nickname: data.nickname,
                            profile_logo: data.profile_logo,
                        });
                    }
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
                profile_logo: state.profile_logo,
                isEmailSent: state.isEmailSent,
            }),
        },
    ),
);
