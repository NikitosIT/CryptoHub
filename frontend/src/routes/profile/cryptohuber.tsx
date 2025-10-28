import ProfileCryptoHuber from "@/pages/auth/profile/ProfileCryptoHuber";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/profile/cryptohuber")({
  component: ProfileCryptoHuber,
});
