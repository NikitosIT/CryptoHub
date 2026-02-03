import {
  Box,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { AuthButton } from "@/components/ui/AuthButton";
import { createRouteGuard } from "@/hooks/routeGuards";
import AuthGoogle from "@/routes/auth/-components/AuthGoogle";
import { useLogin } from "@/routes/auth/-hooks/useLogin";

const loginSearchSchema = z.object({
  redirectTo: z.string().optional(),
});
export const Route = createFileRoute("/auth/")({
  validateSearch: loginSearchSchema,
  beforeLoad: createRouteGuard({
    requireNoAuth: true,
    allowTwoFactorNoAuth: true,
  }),
  component: EmailAuth,
});

export function EmailAuth() {
  const { register, handleSubmit, formErrors, isPending } = useLogin();

  return (
    <Container
      maxWidth="lg"
      sx={{ mt: { xs: 4, sm: 6, md: 10 }, px: { xs: 2, sm: 3 } }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={{ xs: 4, sm: 5, md: 6 }}
        justifyContent="center"
        alignItems={{ xs: "stretch", md: "flex-start" }}
      >
        <Paper
          sx={{
            p: { xs: 3, sm: 3.5, md: 4 },
            borderRadius: { xs: 2, sm: 2.5, md: 3 },
            width: { xs: "100%", md: 400 },
            bgcolor: "rgba(30, 30, 30, 0.8)",
            color: "white",
          }}
        >
          <Typography variant="h5" fontWeight={600} textAlign="center" mb={3}>
            Email Login
          </Typography>

          <Box
            component="form"
            onSubmit={(e) => {
              void handleSubmit(e);
            }}
            display="flex"
            flexDirection="column"
            gap={2}
          >
            <TextField
              label="Email"
              type="email"
              {...register("email")}
              error={!!formErrors.email}
              helperText={formErrors.email?.message || ""}
              fullWidth
            />

            <AuthButton
              type="submit"
              isLoading={isPending}
              loadingText="Sending..."
            >
              Get code
            </AuthButton>
          </Box>
        </Paper>

        <AuthGoogle />
      </Stack>
    </Container>
  );
}
