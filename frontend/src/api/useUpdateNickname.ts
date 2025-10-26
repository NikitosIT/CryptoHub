import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { nicknameSchema } from "@/lib/validatorSchemas";
import { useUserStore } from "@/store/useUserStore";

export const useUpdateNickname = () => {
    const { user, setNickname } = useUserStore();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newNick: string) => {
            // ✅ Проверка схемы (Zod)
            const result = nicknameSchema.safeParse(newNick);
            if (!result.success) {
                throw new Error(result.error.issues[0].message);
            }

            // ✅ Проверка пользователя
            if (!user) throw new Error("Пользователь не найден");

            // ✅ Обновляем ник в базе Supabase
            const { error } = await supabase
                .from("profiles")
                .update({
                    nickname: newNick,
                    last_changed: new Date().toISOString(),
                })
                .eq("id", user.id);

            if (error) {
                throw new Error("Ошибка обновления ника: " + error.message);
            }
        },

        onSuccess: async (_data, newNick) => {
            // ✅ Обновляем Zustand и кэш React Query
            await queryClient.invalidateQueries({
                queryKey: ["profile", user?.id],
            });
            setNickname(newNick);
        },
    });
};
