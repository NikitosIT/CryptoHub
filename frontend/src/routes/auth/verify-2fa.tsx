import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { createRouteGuard } from "@/hooks/routeGuards";
import { Verify2FAPage } from "@/routes/auth/-components/Verify2FAPage";

const verify2FASearchSchema = z.object({
  redirectTo: z.string().optional(),
});

export const Route = createFileRoute("/auth/verify-2fa")({
  validateSearch: verify2FASearchSchema,
  beforeLoad: createRouteGuard({
    requireNoAuth: false,
  }),
  component: Verify2FAPage,
});
