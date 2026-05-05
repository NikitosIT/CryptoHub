import { z } from "zod";

export const transferBodySchema = z
  .object({
    senderCardId: z.string().min(1, "Sender id is required"),
    senderCardPin: z.string().regex(/^\d{4}$/, "PIN must be exactly 4 digits"),
    amount: z.number().positive("Amount must be greater than 0"),
    receiverCardId: z.string().min(1, "Receiver id is required"),
  })
  .strict()
  .refine(
    ({ receiverCardId, senderCardId }) => receiverCardId !== senderCardId,
    {
      message: "Cannot transfer to yourself",
      path: ["toUserId"],
    },
  );

export const transferSuccessResponseSchema = z
  .object({
    message: z.literal("Transfer successful"),
  })
  .strict();

export type TransferInput = z.infer<typeof transferBodySchema>;
