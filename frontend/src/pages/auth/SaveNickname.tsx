import { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import { useSaveNickname } from "@/api/useSaveNickname";

export default function SaveNickname() {
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const saveNickname = useSaveNickname();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await saveNickname.mutateAsync(nickname);
      navigate({ to: "/profile/main" });
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      display="flex"
      flexDirection="column"
      gap={2}
      sx={{ width: 400, mx: "auto", mt: 8 }}
    >
      <Typography variant="h5" textAlign="center" color="white" mb={2}>
        Выберите никнейм
      </Typography>

      <TextField
        label="Никнейм"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        error={!!error}
        helperText={error || " "}
        fullWidth
      />

      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={saveNickname.isPending}
      >
        {saveNickname.isPending ? "Сохранение..." : "Продолжить"}
      </Button>
    </Box>
  );
}
