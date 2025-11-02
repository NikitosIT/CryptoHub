import { useRoutesProtected } from "@/hooks/useRoutesProtected";
import EmailAuth from "@/components/auth/EmaulAuth";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/email")({
  component: () => {
    useRoutesProtected({ requireNoAuth: true });
    return <EmailAuth />;
  },
});

//auth/login
