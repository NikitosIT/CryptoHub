import z from "zod";

export const toggleReactionParamsSchema = z
  .object({
    postId: z
      .string()
      .regex(/^[1-9]\d*$/)
      .transform(Number),
  })
  .strict();

export const toggleReactionBodySchema = z
  .object({
    reactionType: z.enum(["LIKE", "DISLIKE"]),
  })
  .strict();
