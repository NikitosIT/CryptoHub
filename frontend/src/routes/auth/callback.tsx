import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { ROUTES } from '@/constants/routesPath';

import AuthCallback from './-components/AuthCallback';

const callbackSearchSchema = z.object({
  redirectTo: z.string().optional(),
});

export const Route = createFileRoute(ROUTES.AUTH.CALLBACK)({
  validateSearch: callbackSearchSchema,
  component: AuthCallback,
});
