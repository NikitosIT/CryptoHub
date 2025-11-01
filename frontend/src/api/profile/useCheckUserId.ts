import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export const useCheckUserId = () => {
    return useMutation({
        mutationFn: async (userId: string) => {
            const { data, error } = await supabase
                .from("profiles")
                .select("nickname")
                .eq("id", userId)
                .maybeSingle();

            if (error) throw new Error(error.message);
            return data;
        },
    });
};
///Более понятнфе названия
