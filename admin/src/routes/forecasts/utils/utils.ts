export function isAuthError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.includes("Authentication required") ||
      error.message.includes("Unauthorized"))
  );
}
