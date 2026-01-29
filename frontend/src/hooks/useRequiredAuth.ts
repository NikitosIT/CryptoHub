import { useAuthState } from "@/routes/auth/-hooks/useAuthState";

export function useRequiredAuth() {
  const { user } = useAuthState();

  if (!user?.id) {
    throw new Error("useRequiredAuth: user is not authenticated");
  }

  return {
    user,
    userId: user.id,
  };
}
