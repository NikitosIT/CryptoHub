import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export const useVerifyOtp = () => {
    return useMutation({
        mutationFn: async (
            { email, code }: { email: string; code: string },
        ) => {
            if (!email) {
                throw new Error("Email не найден — попробуйте снова войти");
            }

            console.log("verifyOtp input:", { email, code });

            const { data, error } = await supabase.auth.verifyOtp({
                email,
                token: code,
                type: "email",
            });

            console.log("verifyOtp result:", { data, error });

            if (error) throw new Error(error.message);

            let user = data.user;
            if (!user) {
                const { data: userData } = await supabase.auth.getUser();
                user = userData.user;
            }

            if (!user) throw new Error("Пользователь не найден");

            return user;
        },
    });
};
