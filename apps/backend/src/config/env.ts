export const env = {
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.trim(),
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  BULLMQ_REDIS_URL:
    process.env.BULLMQ_REDIS_URL ||
    process.env.REDIS_URL ||
    "redis://localhost:6379",
  COINGECKO_KEY: process.env.COINGECKO_KEY,
  DATABASE_URL: process.env.DATABASE_URL,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  LOKI_URL: process.env.LOKI_URL || "http://localhost:3100",
  NODE_ENV: process.env.NODE_ENV || "dev",
  PORT: Number(process.env.PORT) || 3000,
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM: process.env.RESEND_FROM,
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  TELEGRAM_WEBHOOK_SECRET: process.env.TELEGRAM_WEBHOOK_SECRET,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
};
