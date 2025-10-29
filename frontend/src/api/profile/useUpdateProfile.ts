import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useUserStore } from "@/store/useUserStore";

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    const { setNickname, setProfileLogo } = useUserStore();

    const mutation = useMutation({
        mutationFn: async (
            payload: { nickname?: string; profile_logo?: string },
        ) => {
            const user = useUserStore.getState().user;
            if (!user) throw new Error("Пользователь не найден");

            const { data: { session } } = await supabase.auth.getSession();

            const res = await fetch(
                `${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/update-nickname`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session?.access_token}`,
                    },
                    body: JSON.stringify({
                        user_id: user.id,
                        ...payload, // 👈 отправляем только то, что реально передали
                    }),
                },
            );

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Ошибка при обновлении профиля");
            }
            return data;
        },

        onSuccess: (data) => {
            if (data.nickname) setNickname(data.nickname);
            if (data.profile_logo) setProfileLogo(data.profile_logo);
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        },
    });

    return mutation;
};
