import { createFileRoute } from '@tanstack/react-router';

import { ROUTES } from '@/constants/routesPath';
import { createRouteGuard } from '@/hooks/routeGuards';

import ProfileTwoFactor from './-components/ProfileTwoFactor';

export const Route = createFileRoute(ROUTES.PROFILE.TWOFACTOR)({
  beforeLoad: createRouteGuard({ requireAuth: true }),
  component: ProfileTwoFactor,
});
