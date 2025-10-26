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
import { useUserStore } from "@/store/useUserStore";
import HomeRedirectIcon from "./HomeRedirect";
import { codeSchema } from "@/lib/validatorSchemas";
import ResendEmailCodePage from "./ResendCode";
import SaveNickname from "./SaveNickname";
import { useVerifyOtp } from "@/api/useVerifyOtp";
import { useCheckProfile } from "@/api/useCheckProfile";

export default function VerifyEmailPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"verify" | "nickname">("verify");

  const email = useUserStore((s) => s.email);
  const navigate = useNavigate();
  const { setUser, setNickname: setStoreNickname } = useUserStore();

  const verifyOtp = useVerifyOtp();
  const checkProfile = useCheckProfile();

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = codeSchema.safeParse(code);
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    try {
      const user = await verifyOtp.mutateAsync({ email, code });
      setUser(user);

      const profile = await checkProfile.mutateAsync(user.id);
      if (profile?.nickname) {
        setStoreNickname(profile.nickname);
        navigate({ to: "/auth/profile" });
      } else {
        setStep("nickname");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };
  const loading = verifyOtp.isPending || checkProfile.isPending;

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <HomeRedirectIcon />
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        {step === "verify" ? (
          <>
            <Typography variant="h5" fontWeight={600} textAlign="center" mb={3}>
              Подтверждение Email
            </Typography>

            <Box
              component="form"
              onSubmit={verifyCode}
              display="flex"
              flexDirection="column"
              gap={2}
            >
              <TextField
                label="Код из письма"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                error={!!error}
                helperText={error || ""}
                fullWidth
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
              >
                {loading ? "Проверка..." : "Подтвердить"}
              </Button>
              <ResendEmailCodePage />
            </Box>
          </>
        ) : (
          <SaveNickname />
        )}
      </Paper>
    </Container>
  );
}
