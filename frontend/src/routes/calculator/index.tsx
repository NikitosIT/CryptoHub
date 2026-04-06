import { createFileRoute, redirect } from '@tanstack/react-router';

import { ROUTES } from '@/constants/routesPath';

export const Route = createFileRoute(ROUTES.CALCULATOR.INDEX)({
  beforeLoad: () => redirect({ to: '/calculator/spot', replace: true }),
  component: function CalculatorIndex() {
    return null;
  },
});
