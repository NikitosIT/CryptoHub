import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/calculator/')({
  beforeLoad: () => redirect({ to: '/calculator/spot', replace: true }),
  component: function CalculatorIndex() {
    return null;
  },
});
