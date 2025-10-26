import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useUserStore } from "@/store/useUserStore";

export function useAuthListener() {
    const { setUser } = useUserStore();
    const [loadingSession, setLoadingSession] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            // 1️⃣ Проверяем, есть ли пользователь (даже если IndexedDB ещё не восстановилась)
            const { data, error } = await supabase.auth.getSession();

            if (error) console.error("Ошибка получения сессии:", error.message);
            if (data?.session?.user) setUser(data.session.user);

            setLoadingSession(false);
        };

        initAuth();

        // 2️⃣ Подписка на изменения авторизации
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, [setUser]);

    return { loadingSession };
}
