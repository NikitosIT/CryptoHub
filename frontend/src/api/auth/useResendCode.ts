import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export function useResendCode() {
    return useMutation({
        mutationFn: async (email: string) => {
            const { error } = await supabase.auth.signInWithOtp({ email });
            if (error) throw new Error(error.message);
        },
    });
}
