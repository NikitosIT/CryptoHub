export const redisKeys = {
  card: {
    balance: (cardId: string) => `card:${cardId}:balance`,
  },
  transfer: {
    pinFail: (cardId: string) => `transfer:card:${cardId}:pin:fail`,
    pinBlock: (cardId: string) => `transfer:card:${cardId}:pin:block`,
  },
} as const;
