import {
  Typography,
  List,
  ListItemButton,
  Divider,
  Paper,
} from "@mui/material";
import { useUserStore } from "@/store/useUserStore";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import ProfileLogo from "./ProfileLogo";

export default function ProfileMain() {
  const navigate = useNavigate();

  const { user, nickname, logout, setNickname } = useUserStore();

  useEffect(() => {
    if (!user) navigate({ to: "/auth/email" });
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate({ to: "/auth/email", replace: true });
    } catch (e: any) {
      console.error("Ошибка выхода:", e?.message || e);
      setNickname(null);
      navigate({ to: "/auth/email", replace: true });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center px-4 mt-10">
      <Paper
        elevation={6}
        sx={{
          maxWidth: 500,
          width: "100%",
          textAlign: "center",
          p: 4,
          borderRadius: "16px",
          background: "linear-gradient(to bottom, #18181b, #000)",
          border: "1px solid #27272a",
        }}
      >
        {/* Приветствие */}
        <Typography
          variant="h5"
          sx={{
            mb: 2,
            color: "#fff",
            fontWeight: 600,
            letterSpacing: "0.5px",
          }}
        >
          Привет, <span style={{ color: "#fb923c" }}>{nickname || "..."}</span>{" "}
          👋
        </Typography>
        <ProfileLogo />
        <Typography
          variant="body2"
          sx={{ color: "#a1a1aa", mb: 3, lineHeight: 1.5 }}
        >
          Добро пожаловать в ваш профиль! <br />
          Выберите раздел ниже, чтобы управлять настройками.
        </Typography>

        {/* Разделы */}
        <List sx={{ color: "#fff" }}>
          {/* Изменение никнейма */}
          <ListItemButton
            sx={{
              justifyContent: "center",
              py: 1.2,
              borderRadius: "8px",
              transition: "0.25s",
              "&:hover": {
                backgroundColor: "rgba(251,146,60,0.1)",
                color: "#fb923c",
              },
            }}
            onClick={() => navigate({ to: "/profile/editname" })}
          >
            <Typography sx={{ fontSize: "0.95rem", fontWeight: 500 }}>
              Изменение никнейма
            </Typography>
          </ListItemButton>
          <Divider sx={{ backgroundColor: "#3f3f46", my: 0.5 }} />

          {/* КриптоХабер */}
          <ListItemButton
            sx={{
              justifyContent: "center",
              py: 1.2,
              borderRadius: "8px",
              transition: "0.25s",
              "&:hover": {
                backgroundColor: "rgba(251,146,60,0.1)",
                color: "#fb923c",
              },
            }}
            onClick={() => navigate({ to: "/profile/cryptohuber" })}
          >
            <Typography sx={{ fontSize: "0.95rem", fontWeight: 500 }}>
              КриптоХабер
            </Typography>
          </ListItemButton>
          <Divider sx={{ backgroundColor: "#3f3f46", my: 0.5 }} />

          {/* Любимые видео */}
          <ListItemButton
            sx={{
              justifyContent: "center",
              py: 1.2,
              borderRadius: "8px",
              transition: "0.25s",
              "&:hover": {
                backgroundColor: "rgba(251,146,60,0.1)",
                color: "#fb923c",
              },
            }}
            onClick={() => navigate({ to: "/profile/likesposts" })}
          >
            <Typography sx={{ fontSize: "0.95rem", fontWeight: 500 }}>
              Любимые видео
            </Typography>
          </ListItemButton>
          <Divider sx={{ backgroundColor: "#3f3f46", my: 0.5 }} />

          {/* Избранные видео */}
          <ListItemButton
            sx={{
              justifyContent: "center",
              py: 1.2,
              borderRadius: "8px",
              transition: "0.25s",
              "&:hover": {
                backgroundColor: "rgba(251,146,60,0.1)",
                color: "#fb923c",
              },
            }}
            onClick={() => navigate({ to: "/profile/favoritevideos" })}
          >
            <Typography sx={{ fontSize: "0.95rem", fontWeight: 500 }}>
              Избранные видео
            </Typography>
          </ListItemButton>
        </List>
        <button
          onClick={handleLogout}
          className="text-red-500 cursor-pointer hover:text-red-400"
        >
          LogOut
        </button>
      </Paper>
    </div>
  );
}
