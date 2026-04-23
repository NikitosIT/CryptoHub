import { NextFunction, Request, Response } from "express";
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

export type TransferRequestBody = z.infer<typeof transferBodySchema>;
export type TransferLocals = {
  transferRequest: TransferRequestBody;
};

export const validateTransferRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const locals = res.locals as TransferLocals;

    locals.transferRequest = transferBodySchema.parse(req.body);
    next();
  } catch (error) {
    next(error);
  }
};
