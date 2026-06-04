export const BULLMQ = {
  email: {
    queueName: "email",
    jobs: {
      sendWelcomeEmail: "send-welcome-email",
    },
  },
  cronExample: {
    queueName: "cron-example-message",
    jobs: {
      sendPeriodicMessage: "send-periodic-message",
    },
    schedulers: {
      periodicMessage: "cron-example-periodic-message",
    },
  },
  snapshots: {
    queueName: "cryptotokens-snapshots",
    jobs: {
      createWeeklySnapshot: "create-weekly-snapshot",
    },
    schedulers: {
      weeklySnapshot: "cryptotokens-snapshots-weekly-snapshot",
    },
  },
} as const;
