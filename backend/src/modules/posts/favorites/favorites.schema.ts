import z from "zod";

export const toggleFavoriteBodySchema = z
  .object({
    postId: z.number().int().positive(),
  })
  .strict();

export type ToggleFavoriteBody = z.infer<typeof toggleFavoriteBodySchema>;
