import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export const useVerifyOtp = () => {
    return useMutation({
        mutationFn: async (
            { email, code }: { email: string | null; code: string },
        ) => {
            if (!email) {
                throw new Error("Email не найден — попробуйте снова войти");
            }

            const { data, error } = await supabase.auth.verifyOtp({
                email,
                token: code,
                type: "email",
            });

            if (error) throw new Error(error.message);

            return data.session;
        },
    });
};
