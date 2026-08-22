import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { FuturesFormData } from '@/lib/validatorSchemas';

import type { ShareCryptoType } from './useSpotStore';

export type PositionType = 'long' | 'short';

export type FuturesState = {
  leverage: number | null;

  position: PositionType;

  setPosition: (position: PositionType) => void;
  calculator: (data: FuturesFormData) => void;
} & ShareCryptoType;

export const useFuturesStore = create<FuturesState>()(
  persist(
    (set, get) => ({
      margin: null,
      leverage: 1,
      entryPrice: null,
      exitPrice: null,
      profit: null,
      position: 'long',

      setPosition: (position) => set({ position, profit: null }),

      calculator: (data: FuturesFormData) =>
        set(() => {
          const { position } = get();
          const positionSize = data.margin * data.leverage;
          const quantity = positionSize / data.entryPrice;
          const priceDiff =
            position === 'long'
              ? data.exitPrice - data.entryPrice
              : data.entryPrice - data.exitPrice;
          const profit = quantity * priceDiff;

          return {
            profit,
            margin: data.margin,
            leverage: data.leverage,
            entryPrice: data.entryPrice,
            exitPrice: data.exitPrice,
          };
        }),

      reset: () =>
        set({
          margin: null,
          leverage: 1,
          entryPrice: null,
          exitPrice: null,
          profit: null,
        }),
    }),
    {
      name: 'crypto-futures-calculator',
      partialize: (state) => ({
        margin: state.margin,
        leverage: state.leverage,
        entryPrice: state.entryPrice,
        exitPrice: state.exitPrice,
        profit: state.profit,
        position: state.position,
      }),
    },
  ),
);
