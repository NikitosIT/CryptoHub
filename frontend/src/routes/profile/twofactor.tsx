import { createFileRoute } from '@tanstack/react-router';

import { createRouteGuard } from '@/hooks/routeGuards';

import ProfileTwoFactor from './-components/ProfileTwoFactor';

export const Route = createFileRoute('/auth/verify-2fa')({
  beforeLoad: createRouteGuard({ requireAuth: true }),
  component: ProfileTwoFactor,
});
