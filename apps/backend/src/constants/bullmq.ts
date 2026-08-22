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
          pattern: "0 0 * * 1",
        },
      },
    },
    cryptotokensForecasts: {
      name: "cryptotokensForecast",
      jobs: {
        syncCryptotokensForecast: {
          name: "sync-cryptotokens-forecasts",
        },
      },
      schedulers: {
        syncCryptotokensForecast: {
          id: "sync-cryptotokens-forecasts-scheduler",
        },
      },
    },
  },
} as const;
