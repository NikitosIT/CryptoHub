import { createFileRoute } from "@tanstack/react-router";

import { createRouteGuard } from "@/hooks/routeGuards";

import ProfileTwoFactor from "./-components/ProfileTwoFactor";

export const Route = createFileRoute("/profile/twofactor")({
  beforeLoad: createRouteGuard({ requireAuth: true }),
  component: ProfileTwoFactor,
});
