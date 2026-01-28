import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email");

export const codeSchema = z.string().regex(/^\d{6}$/, "Code must contain 6 digits");

