import { MainLayout } from "@/components/MainLayout";
import { createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: MainLayout,
});
