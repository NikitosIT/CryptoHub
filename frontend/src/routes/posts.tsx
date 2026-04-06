import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { ROUTES } from '@/constants/routesPath';
import { createRouteGuard } from '@/hooks/routeGuards';

import { PostsTelegram } from './posts/-components/PostsTelegram';

const postsSearchSchema = z.object({
  mode: z.enum(['all', 'liked', 'disliked', 'favorites']).optional().default('all'),
});

export const Route = createFileRoute(ROUTES.POSTS.INDEX)({
  validateSearch: postsSearchSchema,
  beforeLoad: async ({ location, search }) => {
    const requiresAuth =
      search.mode === ROUTES.POSTS.LIKED ||
      search.mode === ROUTES.POSTS.DISLIKED ||
      search.mode === ROUTES.POSTS.FAVORITES;

    if (requiresAuth) {
      const guard = createRouteGuard({ requireAuth: true });
      await guard({ location });
    }
  },
  component: PostsTelegram,
});
