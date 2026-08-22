import { createRootRoute } from '@tanstack/react-router';

import { MainLayout } from '@/layout/MainLayout';

export const Route = createRootRoute({
  component: MainLayout,
});
