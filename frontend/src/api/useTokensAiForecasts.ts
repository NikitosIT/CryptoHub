import { supabase } from "@/lib/supabaseClient";
import { useFiltersStore } from "@/store/useFiltersStore";
import { useQuery } from "@tanstack/react-query";

export function useTokensAiForecasts() {
    const { selectedToken } = useFiltersStore();
    return useQuery({
        queryKey: ["forecast", selectedToken?.label],
        enabled: false,
        queryFn: async () => {
            if (!selectedToken) return null;

            const { data, error } = await supabase
                .from("token_forecasts")
                .select("*")
                .eq("token_name", selectedToken.label)
                .eq("status", "approved")
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) throw new Error(error.message);
            return data;
        },
    });
}

//useTokensAiForecasts
