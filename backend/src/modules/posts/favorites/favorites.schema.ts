import z from "zod";

export const toggleFavoriteParamsSchema = z
  .object({
    postId: z
      .string()
      .regex(/^[1-9]\d*$/)
      .transform(Number),
  })
  .strict();
