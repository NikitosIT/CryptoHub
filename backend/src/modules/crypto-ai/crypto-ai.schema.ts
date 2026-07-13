import { z } from "zod";

import { CRYPTO_AI_ACTIONS } from "./crypto-ai.constants.js";

export const chatStreamBodySchema = z
  .object({
    action: z.enum([CRYPTO_AI_ACTIONS.TOKEN_FORECAST]),
    tokenSymbol: z.string().min(1).max(20).toUpperCase(),
  })
  .strict();

export const chatByIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const chatByIdResponseSchema = z
  .object({
    id: z.string(),
    action: z.string(),
    tokenSymbol: z.string(),
    status: z.enum(["STREAMING", "COMPLETED", "ABORTED"]),
    responseText: z.string().nullable(),
    createdAt: z.iso.datetime(),
  })
  .strict();

export const usageTodayResponseSchema = z
  .object({
    used: z.number().int().nonnegative(),
    limit: z.number().int().nonnegative(),
    remaining: z.number().int().nonnegative(),
  })
  .strict();

export type ChatStreamBody = z.infer<typeof chatStreamBodySchema>;
export type ChatByIdParams = z.infer<typeof chatByIdParamsSchema>;
export type ChatByIdResponse = z.infer<typeof chatByIdResponseSchema>;
export type UsageTodayResponse = z.infer<typeof usageTodayResponseSchema>;
