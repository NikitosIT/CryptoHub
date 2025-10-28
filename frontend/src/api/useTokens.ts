import { CMC_LINK, COINGLASS_LINK, X_LINK } from "@/constants/links";
import { supabase } from "@/lib/supabaseClient";
import type { Token } from "@/types/TokenAndAuthorTypes";
import { useQuery } from "@tanstack/react-query";

export const useTokens = () => {
    return useQuery<Token[]>({
        queryKey: ["cryptotokens"],
        queryFn: async () => {
            const { data, error } = await supabase.from("cryptotokens").select(
                "*",
            );
            if (error) throw error;
            return data.map((token) => ({
                label: token.token_name,
                value: token.token_name,
                cmc: `${CMC_LINK}${token.cmc_link}`,
                coinglass: `${COINGLASS_LINK}${token.token_name}`,
                homelink: token.home_link,
                xlink: `${X_LINK}${token.x_link}`,
            }));
        },
        staleTime: Infinity,
        gcTime: Infinity,
    });
};
