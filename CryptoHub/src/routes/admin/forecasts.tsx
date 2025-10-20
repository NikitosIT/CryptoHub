import AdminForecasts from "@/routes/admin/PrivateForecasts";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/forecasts")({
  component: AdminForecasts,
});
