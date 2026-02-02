import { Container, Paper, Stack, Typography } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { createRouteGuard } from "@/hooks/routeGuards";
import { OtpForm } from "@/routes/auth/-components/OtpForm";
import { useVerifyOTP } from "@/routes/auth/-hooks/useVerifyOTP";

const verifySearchSchema = z.object({
  redirectTo: z.string().optional(),
  mode: z.literal("email").optional(),
  email: z.string().email().optional(),
});

export const Route = createFileRoute("/auth/verify")({
  validateSearch: verifySearchSchema,
  beforeLoad: createRouteGuard({
    requireNoAuth: false,
    allowTwoFactorNoAuth: true,
  }),
  component: VerifyEmailPage,
});

export function VerifyEmailPage() {
  const {
    showOTPField,
    control,
    otpFormErrors,
    isOtpSubmitting,
    handleOtpSubmit,
    isAuthLoading,
  } = useVerifyOTP();

  return (
    <Container
      maxWidth="sm"
      sx={{ mt: { xs: 4, sm: 6, md: 10 }, px: { xs: 2, sm: 3 } }}
    >
      <Paper
        sx={{
          p: { xs: 3, sm: 3.5, md: 4 },
          borderRadius: { xs: 2, sm: 2.5, md: 3 },
          bgcolor: "rgba(30, 30, 30, 0.8)",
          color: "white",
        }}
      >
        <Stack spacing={{ xs: 2, sm: 2.5, md: 3 }}>
          {isAuthLoading || !showOTPField ? (
            <Typography
              textAlign="center"
              sx={{
                color: "white",
                fontSize: { xs: "14px", sm: "16px" },
              }}
            >
              Verifying authentication...
            </Typography>
          ) : (
            <OtpForm
              control={control}
              errors={otpFormErrors}
              isSubmitting={isOtpSubmitting}
              onSubmit={(e) => {
                void handleOtpSubmit(e);
              }}
            />
          )}
        </Stack>
      </Paper>
    </Container>
  );
}
