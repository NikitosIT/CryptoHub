import { z } from "zod";

const BaseReactionFields = z.object({
  user_id: z.string(),
  post_id: z.number(),
});

const ToggleFavoriteSchema = BaseReactionFields;

const ToggleReaction = BaseReactionFields.extend({
  reaction_type: z.enum(["LIKE", "DISLIKE"]),
});

//

const CryptoTokenSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string(),
  image: z.string(),
  current_price: z.number(),
  market_cap: z.number(),
  market_cap_rank: z.number(),
});

const CryptoTokensSchema = z.array(CryptoTokenSchema);

const TransfersBankSchema = z.object({
  id: z.string(),
  amount: z.number().nonnegative(),
  pin: z.string().regex(/^\d{4}$/, "PIN must be exactly 4 digits"),
  toUserId: z.string(),
});

const GetAmountSchema = z.object({
  id: z.string(),
  pin: z.string().regex(/^\d{4}$/, "PIN must be exactly 4 digits"),
});

export {
  CryptoTokensSchema,
  GetAmountSchema,
  ToggleFavoriteSchema,
  ToggleReaction,
  TransfersBankSchema,
};
