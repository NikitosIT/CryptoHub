import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useUserStore } from "@/store/useUserStore";
import { useCheckProfile } from "@/api/profile/useCheckProfile";
import { CircularProgress, Box, Typography } from "@mui/material";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { user, setNickname } = useUserStore();
  const checkProfile = useCheckProfile();

  useEffect(() => {
    const handleRedirect = async () => {
      if (!user) return;

      try {
        const profile = await checkProfile.mutateAsync(user.id);

        if (profile?.nickname) {
          setNickname(profile.nickname);
          navigate({ to: "/profile/main", replace: true });
        } else {
          navigate({ to: "/auth/savenickname" });
        }
      } catch (err) {
        console.error("Ошибка проверки профиля:", err);
        navigate({ to: "/auth/savenickname" });
      }
    };

    handleRedirect();
  }, [user]);

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
    >
      <CircularProgress sx={{ color: "#9333ea", mb: 3 }} />
      <Typography>Авторизация...</Typography>
    </Box>
  );
}
