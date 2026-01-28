import { Container, Paper, Stack, Typography } from "@mui/material";

import { TwoFAForm } from "@/components/ui/TwoFAForm";
import { useVerify2FA } from "@/routes/auth/-hooks/use2FAHook";

export function Verify2FAPage() {
  const {
    control,
    twoFAFormErrors,
    isAuthLoading,
    handle2FASubmit,
    is2FASubmitting,
    isCodeValid,
  } = useVerify2FA();

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
          {isAuthLoading ? (
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
            <TwoFAForm
              control={control}
              errors={twoFAFormErrors}
              isSubmitting={is2FASubmitting}
              isCodeValid={isCodeValid}
              onSubmit={(e) => {
                void handle2FASubmit(e);
              }}
            />
          )}
        </Stack>
      </Paper>
    </Container>
  );
}
