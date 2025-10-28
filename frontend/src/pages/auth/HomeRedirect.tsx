import { useNavigate } from "@tanstack/react-router";
import HomeIcon from "@mui/icons-material/Home";
import { IconButton, Tooltip } from "@mui/material";

export default function HomeRedirectIcon() {
  const navigate = useNavigate();

  return (
    <Tooltip title="На главную">
      <IconButton
        onClick={() => navigate({ to: "/" })}
        color="primary"
        sx={{ position: "absolute", top: 16, left: 16 }}
      >
        <HomeIcon fontSize="large" />
      </IconButton>
    </Tooltip>
  );
}
