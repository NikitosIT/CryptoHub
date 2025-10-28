import { IconButton, Tooltip } from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import { useNavigate } from "@tanstack/react-router"; // <-- если используешь tanstack/router, см. ниже
export default function BackButton() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center">
      <Tooltip title="Назад" arrow>
        <IconButton
          onClick={() => navigate({ to: "/profile/profile" })} // возвращает на предыдущую страницу
          sx={{
            color: "#fb923c",
            backgroundColor: "rgba(251,146,60,0.08)",
            border: "1px solid rgba(251,146,60,0.3)",
            transition: "0.25s",
            "&:hover": {
              backgroundColor: "rgba(251,146,60,0.2)",
              transform: "translateX(-3px)",
            },
          }}
        >
          <ArrowBackIosNewRoundedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </div>
  );
}
