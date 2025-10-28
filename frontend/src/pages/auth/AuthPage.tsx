import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { emailSchema } from "@/lib/validatorSchemas";
import { useUserStore } from "@/store/useUserStore";
import AuthGoogle from "@/pages/auth/AuthGoogle";
import HomeRedirectIcon from "./HomeRedirect";
import { useSendEmail } from "@/api/useSendEmail";

export default function EmailAuthPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setEmail: setStoreEmail } = useUserStore();

  const sendCodeMutation = useSendEmail();

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    try {
      await sendCodeMutation.mutateAsync(email);
      setStoreEmail(email);
      navigate({ to: "/auth/verify" });
      useUserStore.getState().setEmailSent(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <AuthGoogle />
      <HomeRedirectIcon />
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={600} textAlign="center" mb={3}>
          Вход по Email
        </Typography>

        <Box
          component="form"
          onSubmit={sendCode}
          display="flex"
          flexDirection="column"
          gap={2}
        >
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!error || sendCodeMutation.isError}
            helperText={error || sendCodeMutation.error?.message || ""}
            fullWidth
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={sendCodeMutation.isPending}
          >
            {sendCodeMutation.isPending ? "Отправка..." : "Получить код"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
