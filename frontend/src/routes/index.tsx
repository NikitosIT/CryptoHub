import { createFileRoute } from '@tanstack/react-router';

import { ROUTES } from '@/constants/routesPath';

import { PostsTelegram } from './posts/-components/PostsTelegram';

export const Route = createFileRoute(ROUTES.MAIN)({
  component: PostsTelegram,
});
