import { createFileRoute } from '@tanstack/react-router';
import z from 'zod';

import { createRouteGuard } from '@/hooks/routeGuards';
import { redirectTo } from '@/lib/validatorSchemas';
import { Verify2FAPage } from '@/routes/auth/-components/Verify2FAPage';
const searchSchema = z.object({
  redirectTo: redirectTo,
});

export const Route = createFileRoute('/auth/verify-2fa')({
  validateSearch: searchSchema,
  beforeLoad: createRouteGuard({
    requireNoAuth: false,
  }),
  component: Verify2FAPage,
});
