import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

interface UserProfile {
    nickname: string | null;
    profile_logo: string | null;
}

export function useUserProfile(userId: string | undefined) {
    return useQuery<UserProfile | null>({
        queryKey: ["profile", userId],
        queryFn: async () => {
            if (!userId) return null;
            const { data, error } = await supabase
                .from("profiles")
                .select("nickname, profile_logo")
                .eq("id", userId)
                .maybeSingle();
            if (error) throw error;
            return data as UserProfile | null;
        },
        enabled: Boolean(userId),
    });
}

export function useUpdateUserProfile(userId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (update: Partial<UserProfile>) => {
            if (!userId) throw new Error("No userId provided");
            const { data, error } = await supabase
                .from("profiles")
                .update(update)
                .eq("id", userId)
                .select("nickname, profile_logo")
                .maybeSingle();
            if (error) throw error;
            return data as UserProfile | null;
        },
        onSuccess: (_data) => {
            queryClient.invalidateQueries({ queryKey: ["profile", userId] });
        },
    });
}
