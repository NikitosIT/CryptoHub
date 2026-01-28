import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import { IconButton, Tooltip } from "@mui/material";

export default function BackButton() {
  return (
    <div className="flex items-center">
      <Tooltip title="Back" arrow>
        <IconButton
          onClick={() => {
            window.history.back();
          }}
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
