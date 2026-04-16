import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { SpotFormData } from '@/lib/validatorSchemas';

export type ShareCryptoType = {
  margin: number | null;
  entryPrice: number | null;
  exitPrice: number | null;
  profit: number | null;

  reset: () => void;
};

type CryptoSpot = {
  calculator: (data: SpotFormData) => void;
} & ShareCryptoType;

export const useSpotStore = create<CryptoSpot>()(
  persist(
    (set) => ({
      margin: null,
      entryPrice: null,
      exitPrice: null,
      profit: null,

      calculator: (data: SpotFormData) =>
        set(() => {
          const tokenQuantity = data.margin / data.entryPrice;
          const totalAmount = data.exitPrice * tokenQuantity;
          const profit = totalAmount - data.margin;
          return {
            profit,
            margin: data.margin,
            entryPrice: data.entryPrice,
            exitPrice: data.exitPrice,
          };
        }),

      reset: () =>
        set({
          margin: null,
          entryPrice: null,
          exitPrice: null,
          profit: null,
        }),
    }),
    {
      name: 'crypto-spot-calculator',
      partialize: (state) => ({
        priceBuy: state.margin,
        tokenPrice: state.entryPrice,
        sellPrice: state.exitPrice,
        profit: state.profit,
      }),
    },
  ),
);
