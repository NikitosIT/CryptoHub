import { z } from "zod";

export const transferBodySchema = z
  .object({
    id: z.string().min(1, "Sender id is required"),
    amount: z.number().positive("Amount must be greater than 0"),
    pin: z.string().regex(/^\d{4}$/, "PIN must be exactly 4 digits"),
    toUserId: z.string().min(1, "Receiver id is required"),
  })
  .strict()
  .refine(({ id, toUserId }) => id !== toUserId, {
    message: "Cannot transfer to yourself",
    path: ["toUserId"],
  });

export type TransferInput = z.infer<typeof transferBodySchema>;
