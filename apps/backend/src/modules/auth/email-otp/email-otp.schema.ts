import { z } from "zod";

export const sendEmailOtpBodySchema = z.object({
  email: z.email(),
  type: z.literal("sign-in"),
});

export const sendEmailOtpResponseSchema = z.object({
  success: z.boolean(),
});

export const signInWithEmailOtpBodySchema = z.object({
  email: z.email(),
  otp: z.string().length(6),
});

export const authUserSchema = z.object({
  id: z.string(),
  email: z.email(),
  emailVerified: z.boolean(),
  name: z.string(),
  image: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const signInWithEmailOtpResponseSchema = z.object({
  token: z.string(),
  user: authUserSchema,
});
