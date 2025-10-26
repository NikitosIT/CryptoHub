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
import { supabase } from "@/lib/supabaseClient";
import HomeRedirectIcon from "./HomeRedirect";
import { emailSchema } from "@/lib/validatorSchemas";
import { useUserStore } from "@/store/useUserStore";

export default function EmailAuthPage() {
  const [email, setEmail] = useState("");
  const [, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setEmail: setStoreEmail } = useUserStore();
  const navigate = useNavigate();

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setError(error.message);
      return;
    }
    setStoreEmail(email);
    setSent(true);

    navigate({ to: "/auth/verify" });
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
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
            error={!!error}
            helperText={error || ""}
            fullWidth
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={!email}
          >
            Получить код
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
