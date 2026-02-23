import type { FuturesFormData } from '@/lib/validatorSchemas';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PositionType = 'long' | 'short';

export interface FuturesState {
  margin: number | null;
  leverage: number | null;
  entryPrice: number | null;
  sellPrice: number | null;
  profit: number | null;
  position: PositionType;

  setPosition: (position: PositionType) => void;
  calculator: (data: FuturesFormData) => void;
  reset: () => void;
}

export const useFuturesStore = create<FuturesState>()(
  persist(
    (set, get) => ({
      margin: null,
      leverage: 1,
      entryPrice: null,
      sellPrice: null,
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
              ? data.sellPrice - data.entryPrice
              : data.entryPrice - data.sellPrice;
          const profit = quantity * priceDiff;

          return {
            profit,
            margin: data.margin,
            leverage: data.leverage,
            entryPrice: data.entryPrice,
            sellPrice: data.sellPrice,
          };
        }),

      reset: () =>
        set({
          margin: null,
          leverage: 1,
          entryPrice: null,
          sellPrice: null,
          profit: null,
        }),
    }),
    {
      name: 'crypto-futures-calculator',
      partialize: (state) => ({
        margin: state.margin,
        leverage: state.leverage,
        entryPrice: state.entryPrice,
        sellPrice: state.sellPrice,
        profit: state.profit,
        position: state.position,
      }),
    },
  ),
);
