import { supabase } from "@/lib/supabaseClient";
import { useMutation } from "@tanstack/react-query";

export const useSendEmail = () => {
    return useMutation({
        mutationFn: async (email: string) => {
            const { error } = await supabase.auth.signInWithOtp({ email });
            if (error) throw new Error(error.message);
            return email;
        },
    });
};
