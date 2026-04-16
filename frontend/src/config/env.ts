import { z } from 'zod';

const envSchema = z.object({
  VITE_SUPABASE_URL: z.url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
  VITE_SUPABASE_FUNCTIONS_URL: z.url().optional(),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  console.error(
    'Invalid environment variables:',
    z.flattenError(parsed.error).fieldErrors,
  );
  throw new Error('Invalid environment variables');
}

const { data } = parsed;

export const env = {
  supabaseUrl: data.VITE_SUPABASE_URL,
  supabaseAnonKey: data.VITE_SUPABASE_ANON_KEY,
  supabaseFunctionsUrl:
    data.VITE_SUPABASE_FUNCTIONS_URL ?? `${data.VITE_SUPABASE_URL}/functions/v1`,
} as const;
