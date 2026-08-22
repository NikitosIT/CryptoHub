import { createFileRoute } from '@tanstack/react-router';

import MainPage from '@/components/MainPage';
import { createRouteGuard } from '@/hooks/routeGuards';

export const Route = createFileRoute('/')({
  beforeLoad: createRouteGuard({
    requireAuth: true,
  }),
  component: MainPage,
});
