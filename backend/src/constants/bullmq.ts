export const BULLMQ = {
  queues: {
    cryptotokens: {
      name: "cryptotokens",
      jobs: {
        syncCryptotokens: {
          name: "sync-cryptotokens",
        },
      },
      schedulers: {
        syncCryptotokens: {
          id: "sync-cryptotokens-scheduler",
        },
      },
    },
  },
} as const;
