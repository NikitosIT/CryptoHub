export const CRYPTO_AI_ACTIONS = {
  TOKEN_FORECAST: "TOKEN_FORECAST",
} as const;

export type CryptoAiAction =
  (typeof CRYPTO_AI_ACTIONS)[keyof typeof CRYPTO_AI_ACTIONS];

export const PROMPT_TEMPLATES: Record<CryptoAiAction, string> = {
  [CRYPTO_AI_ACTIONS.TOKEN_FORECAST]:
    "You are an experienced cryptocurrency analyst. Provide a concise short-term forecast for {tokenSymbol} including potential price direction, key support and resistance levels, and overall market sentiment. Keep the response under 300 words and focus on actionable insights.",
};

export const DAILY_REQUEST_LIMIT = 3;
