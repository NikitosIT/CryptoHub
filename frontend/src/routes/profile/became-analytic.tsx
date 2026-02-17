import { createFileRoute } from "@tanstack/react-router";

import { createRouteGuard } from "@/hooks/routeGuards";

export const Route = createFileRoute("/profile/became-analytic")({
  beforeLoad: createRouteGuard({ requireAuth: true }),
  component: UserAnalyticForm,
});

function UserAnalyticForm() {
  return <div />;
}
