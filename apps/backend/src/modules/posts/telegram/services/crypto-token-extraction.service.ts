import { z } from "zod";

import { logger } from "@/libs/logger.js";
import { openai } from "@/libs/openai.client.js";

const OPENAI_MODEL = "gpt-4.1-mini";
const TOKEN_PATTERN = /^[A-Z0-9]{2,12}$/;

const extractionSchema = z.object({
  tokens: z.array(z.string()),
});

const PROMPT = `
Extract cryptocurrency tickers from Telegram posts.

Rules:
- Return cryptocurrency tickers and map coin names or aliases to tickers.
- bitcoin, btc, биток, биткоин -> BTC
- ethereum, eth, ether, эфир -> ETH
- solana, sol -> SOL
- toncoin, ton, тон -> TON
- Remove "$".
- Uppercase only.
- If no cryptocurrency is mentioned, return an empty array.
`.trim();

const normalizeTokens = (tokens: string[]): string[] => {
  return Array.from(
    new Set(
      tokens
        .map((token) => token.trim().toUpperCase().replace(/^\$/, ""))
        .filter((token) => TOKEN_PATTERN.test(token)),
    ),
  );
};

const extractCryptoTokensFromText = async (text: string): Promise<string[]> => {
  const sourceText = text.trim();

  if (!sourceText) {
    return [];
  }

  try {
    const response = await openai.responses.create({
      model: OPENAI_MODEL,
      input: [
        { role: "system", content: PROMPT },
        { role: "user", content: sourceText },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "crypto_token_extraction",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              tokens: {
                type: "array",
                items: { type: "string" },
              },
            },
            required: ["tokens"],
          },
        },
      },
    });

    const parsed = extractionSchema.safeParse(JSON.parse(response.output_text));

    if (!parsed.success) {
      logger.error(
        { issues: parsed.error.issues },
        "Invalid token extraction payload",
      );
      return [];
    }

    return normalizeTokens(parsed.data.tokens);
  } catch (error) {
    logger.error({ err: error }, "Failed to extract crypto tickers from text");
    return [];
  }
};

export const cryptoTokenExtractionService = {
  extractCryptoTokensFromText,
} as const;
