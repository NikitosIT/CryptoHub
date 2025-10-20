import type { Token } from "@/types/token&authorType";
import { create } from "zustand";

interface tokensState {
    selectedToken: Token | null;
    setSelectedToken: (token: Token | null) => void;
}

export const useTokens = create<tokensState>((set) => ({
    selectedToken: null,
    setSelectedToken: (token) => set({ selectedToken: token }),
}));
