import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { createRouteGuard } from "@/hooks/routeGuards";

import { PostsTelegram } from "./posts/-components/PostsTelegram";

const postsSearchSchema = z.object({
  mode: z
    .enum(["all", "liked", "disliked", "favorites"])
    .optional()
    .default("all"),
});

export const Route = createFileRoute("/posts")({
  validateSearch: postsSearchSchema,
  beforeLoad: async ({ location, search }) => {
    const requiresAuth =
      search.mode === "liked" ||
      search.mode === "disliked" ||
      search.mode === "favorites";

    if (requiresAuth) {
      const guard = createRouteGuard({ requireAuth: true });
      await guard({ location });
    }
  },
  component: PostsTelegram,
});
