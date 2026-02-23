import { z } from 'zod';
export const emailSchema = z.string().trim().toLowerCase().email('Enter a valid email');

export const codeSchema = z.string().regex(/^\d{6}$/, 'Code must contain 6 digits');

export const twoFactorCodeSchema = z
  .string()
  .trim()
  .min(1, 'Enter code from the app.')
  .length(6, 'Code must contain 6 digits.')
  .regex(/^\d+$/, 'Code must contain only digits.');

export const nicknameSchema = z
  .string()
  .trim()
  .min(3, 'Minimum 3 characters')
  .max(20, 'Maximum 20 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Only Latin letters, numbers and _ (underscore)')
  .refine((val) => /[a-zA-Z]/.test(val), 'Nickname must contain at least one letter');

export const commentSchema = z.object({
  text: z.string().max(500, 'Comment cannot exceed 500 characters').optional(),
});

export const verifySearchSchema = z.object({
  redirectTo: z.string().optional(),
  mode: z.literal('email').optional(),
  email: z.string().email().optional(),
});

export const loginSearchSchema = z.object({
  redirectTo: z.string().optional(),
});

export const calcSpotSchema = z.object({
  entryPrice: z.number().positive('Price cannot be negative'),
  margin: z.number().positive('Price cannot be negative'),
  exitPrice: z.number().positive('Price cannot be negative'),
});

export type SpotFormData = z.infer<typeof calcSpotSchema>;

export const calcFuturesSchema = z.object({
  margin: z.number().positive(),
  leverage: z.number().max(200).positive(),
  entryPrice: z.number().positive(),
  sellPrice: z.number().positive(),
});

export type FuturesFormData = z.infer<typeof calcFuturesSchema>;
