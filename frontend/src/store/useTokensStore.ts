import type { Token } from "@/types/TokenAndAuthorTypes";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TokensState {
    selectedToken: Token | null;
    setSelectedToken: (token: Token | null) => void;
}

export const useTokensStore = create<TokensState>()(
    persist(
        (set) => ({
            selectedToken: null,
            setSelectedToken: (token) => set({ selectedToken: token }),
        }),
        {
            name: "tokens-storage",
        },
    ),
);

export const useLikedTokensStore = create<TokensState>()(
    persist(
        (set) => ({
            selectedToken: null,
            setSelectedToken: (token) => set({ selectedToken: token }),
        }),
        {
            name: "tokens-liked-storage",
        },
    ),
);
