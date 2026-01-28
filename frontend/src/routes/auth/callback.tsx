import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import AuthCallback from "./-components/AuthCallback";

const callbackSearchSchema = z.object({
  redirectTo: z.string().optional(),
});

export const Route = createFileRoute("/auth/callback")({
  validateSearch: callbackSearchSchema,
  component: AuthCallback,
});
