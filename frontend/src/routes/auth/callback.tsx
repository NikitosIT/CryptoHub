import { createFileRoute } from '@tanstack/react-router';
import z from 'zod';

import { redirectTo } from '@/lib/validatorSchemas';

import AuthCallback from './-components/AuthCallback';
const searchSchema = z.object({
  redirectTo: redirectTo,
});

export const Route = createFileRoute('/auth/callback')({
  validateSearch: searchSchema,
  component: AuthCallback,
});
