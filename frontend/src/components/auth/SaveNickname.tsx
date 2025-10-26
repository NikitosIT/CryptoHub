import { supabase } from "@/lib/supabaseClient";
import { nicknameSchema } from "@/lib/validatorSchemas";
import { useUserStore } from "@/store/useUserStore";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";

export default function SaveNickname() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [nickname, setNickname] = useState("");
  const navigate = useNavigate();
  const { setNickname: setStoreNickname, user } = useUserStore();
  const saveNickname = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = nicknameSchema.safeParse(nickname);
    if (!result.success) {
      setError(result.error.issues[0].message);
      setLoading(false);
      return;
    }

    if (!user) {
      setError("Пользователь не найден.");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ nickname })
      .eq("id", user.id);

    if (error) {
      setError("Не удалось сохранить никнейм.");
      setLoading(false);
      return;
    }

    setStoreNickname(nickname);
    navigate({ to: "/auth/profile" });
    setLoading(false);
  };
  return (
    <>
      <Typography variant="h5" fontWeight={600} textAlign="center" mb={3}>
        Выберите никнейм
      </Typography>

      <Box
        component="form"
        onSubmit={saveNickname}
        display="flex"
        flexDirection="column"
        gap={2}
      >
        <TextField
          label="Никнейм"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
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
          {loading ? "Сохранение..." : "Продолжить"}
        </Button>
      </Box>
    </>
  );
}
