export const redisKeys = {
  user: {
    balance: (userId: string) => `user:${userId}:balance`,
  },
  pin: {
    fail: (userId: string) => `user:${userId}:pin:fail`,
    block: (userId: string) => `user:${userId}:pin:block`,
  },
} as const;
