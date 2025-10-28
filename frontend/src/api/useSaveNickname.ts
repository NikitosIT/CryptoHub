import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useUserStore } from "@/store/useUserStore";
import { nicknameSchema } from "@/lib/validatorSchemas";

export const useSaveNickname = () => {
    const queryClient = useQueryClient();
    const { user, setNickname } = useUserStore();

    return useMutation({
        mutationFn: async (nickname: string) => {
            // 1️⃣ Валидация
            const parsed = nicknameSchema.safeParse(nickname);
            if (!parsed.success) {
                throw new Error(parsed.error.issues[0].message);
            }
            if (!user) throw new Error("Пользователь не найден");

            // 2️⃣ Обновляем профиль
            const { error } = await supabase
                .from("profiles")
                .update({ nickname })
                .eq("id", user.id);

            if (error) throw new Error("Не удалось сохранить никнейм");

            return nickname;
        },

        onSuccess: (nickname) => {
            setNickname(nickname);
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        },
    });
};
