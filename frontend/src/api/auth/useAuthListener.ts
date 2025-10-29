import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useUserStore } from "@/store/useUserStore";

export function useAuthListener() {
    const queryClient = useQueryClient();
    const { setUser, loadProfile, nickname, isProfileLoading, profile_logo } =
        useUserStore
            .getState();

    // 1️⃣ Получаем текущую сессию из Supabase
    const { data: session, isLoading } = useQuery({
        queryKey: ["session"],
        queryFn: async () => {
            const { data, error } = await supabase.auth.getSession();
            if (error) throw error;
            return data.session;
        },
        staleTime: Infinity,
        gcTime: Infinity,
    });
    // 2️⃣ Синхронизация Zustand при первом получении сессии
    useEffect(() => {
        const nextUser = session?.user ?? null;
        const prevUser = useUserStore.getState().user;

        if (prevUser?.id === nextUser?.id) return;

        setUser(nextUser);

        if (nextUser && !isProfileLoading) {
            loadProfile();
        }
    }, [
        session,
        setUser,
        loadProfile,
        nickname,
        isProfileLoading,
        profile_logo,
    ]);

    // 3️⃣ Следим за изменениями авторизации (login / logout / refresh)
    useEffect(() => {
        const { data: sub } = supabase.auth.onAuthStateChange(
            (_event, newSession) => {
                const nextUser = newSession?.user ?? null;
                const prevUser = useUserStore.getState().user;

                if (prevUser?.id === nextUser?.id) return;

                setUser(nextUser);

                if (nextUser && !nickname) {
                    loadProfile();
                }

                queryClient.setQueryData(["session"], newSession);
            },
        );

        return () => sub.subscription.unsubscribe();
    }, [queryClient, setUser, loadProfile, nickname, profile_logo]);

    return { session, isLoading };
}
