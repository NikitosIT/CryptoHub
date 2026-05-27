export const redisKeys = {
  cryptotokens: {
    list: () => "cryptotokens:list",
  },
} as const;

export const TTL = {
  SHORT: 60,
  MEDIUM: 300,
  LONG: 3600,
  DAY: 86400,
} as const;
