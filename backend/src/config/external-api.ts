import { env } from "./env.js";

export const externalApi = {
  coingecko: {
    marketsUrl: `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&x_cg_demo_api_key=${env.COINGECKO_KEY}`,
  },
  openai: {
    responsesUrl: "https://api.openai.com/v1/responses",
  },
  telegram: {
    botUrl: `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}`,
  },
};
