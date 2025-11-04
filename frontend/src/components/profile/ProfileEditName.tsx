import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useUserProfile } from "@/api/user/useUserProfile";

import {
  Typography,
  Container,
  Paper,
  Box,
  TextField,
  Button,
} from "@mui/material";

import BackButton from "./BackButton";

import { nicknameSchema } from "@/lib/validatorSchemas";
import HomeRedirectIcon from "../../components/auth/HomeRedirect";
import { useUpdateProfile } from "@/api/profile/useUpdateProfile";
import { useSession } from "@/api/user/useSession";

export default function ProfileEditName() {
  const session = useSession();
  const user = session?.user ?? null;
  const userId = user?.id;
  const { data: profile } = useUserProfile(userId);
  const mutation = useUpdateProfile(userId);
  const navigate = useNavigate();

  const [newNick, setNewNick] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    navigate({ to: "/auth/email" });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    const result = nicknameSchema.safeParse(newNick.trim());
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    mutation.mutate(
      { nickname: newNick },
      {
        onSuccess: () => setMessage("✅ Ник успешно обновлён!"),
        onError: (err: any) => setError(err.message),
      }
    );
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <HomeRedirectIcon />
      <BackButton />
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={600} mb={2}>
          Привет, {profile?.nickname || user.email}
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          display="flex"
          flexDirection="column"
          gap={2}
        >
          <TextField
            label="Новый никнейм"
            value={newNick}
            onChange={(e) => setNewNick(e.target.value)}
            fullWidth
          />

          {error && <Typography color="error">{error}</Typography>}
          {message && <Typography color="success.main">{message}</Typography>}

          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Обновляем..." : "Сохранить"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
