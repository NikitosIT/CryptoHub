import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Box } from "@mui/material";
import { useCheckUserProfile } from "@/api/profile/useCheckUserProfile";
import { useAuthListener } from "@/api/auth/useAuthListener";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { session } = useAuthListener();
  const user = session?.user ?? null;

  const { data: profile, isLoading, isError } = useCheckUserProfile(user?.id);

  useEffect(() => {
    if (!user || isLoading) return;
    if (profile?.nickname) {
      navigate({ to: "/profile/main", replace: true });
    } else {
      navigate({ to: "/auth/savenickname" });
    }
  }, [user, isLoading, profile, navigate]);
  if (isLoading) return <div>Проверка профиля...</div>;
  if (isError) return <div>Ошибка</div>;
  return (
    <Box
      sx={{
        height: "100vh",
        bgcolor: "black",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    ></Box>
  );
}
