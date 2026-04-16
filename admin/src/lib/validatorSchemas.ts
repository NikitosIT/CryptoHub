import { z } from 'zod';

export const emailSchema = z.email();

export const codeSchema = z.string().regex(/^\d{6}$/, 'Code must contain 6 digits');
