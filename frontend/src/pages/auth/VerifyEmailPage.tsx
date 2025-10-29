import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useUserStore } from "@/store/useUserStore";
import HomeRedirectIcon from "./HomeRedirect";
import { codeSchema } from "@/lib/validatorSchemas";
import ResendEmailCodePage from "./ResendCode";
import { useVerifyOtp } from "@/api/auth/useVerifyOtp";
import { useNavigate } from "@tanstack/react-router";

export default function VerifyEmailPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { email } = useUserStore(); // 🔥 берем email из Zustand
  const verifyOtp = useVerifyOtp();
  const navigate = useNavigate();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = codeSchema.safeParse(code);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      verifyOtp.reset();
      return;
    }

    try {
      await verifyOtp.mutateAsync({ email, code });
      navigate({ to: "/auth/callback" });
    } catch (err: any) {
      console.error("Ошибка при верификации:", err.message);
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <HomeRedirectIcon />
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={600} textAlign="center" mb={3}>
          Подтверждение Email
        </Typography>

        <Box
          component="form"
          onSubmit={handleVerify}
          display="flex"
          flexDirection="column"
          gap={2}
        >
          <TextField
            label="Код из письма"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            error={!!error || verifyOtp.isError}
            helperText={error || verifyOtp.error?.message || ""}
            fullWidth
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={verifyOtp.isPending || !code.trim()}
          >
            {verifyOtp.isPending ? "Проверка..." : "Подтвердить"}
          </Button>
          <ResendEmailCodePage />
        </Box>
      </Paper>
    </Container>
  );
}
