import { z } from "zod";

export const cursorPaginationQuerySchema = z
  .object({
    cursor: z.coerce.number().int().positive().optional(),
  })
  .strict();

export const createPaginatedResponseSchema = <TItem extends z.ZodType>(
  itemSchema: TItem,
) =>
  z
    .object({
      data: z.array(itemSchema),
      nextCursor: z.number().int().positive().nullable(),
    })
    .strict();

export type CursorPaginationQuery = z.infer<typeof cursorPaginationQuerySchema>;
