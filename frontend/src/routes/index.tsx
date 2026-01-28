import { createFileRoute } from "@tanstack/react-router";

import { PostsTelegram } from "./posts/-components/PostsTelegram";

export const Route = createFileRoute("/")({
  component: PostsTelegram,
});
