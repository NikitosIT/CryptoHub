import Countdown from "react-countdown";
import { Box, Typography } from "@mui/material";

interface CountdownDisplayProps {
  date: number;
  onComplete: () => void;
}

export function CountdownDisplay({ date, onComplete }: CountdownDisplayProps) {
  const renderer = ({
    seconds,
    completed,
    total,
  }: {
    seconds: number;
    completed: boolean;
    total: number;
  }) => {
    if (completed) {
      return null;
    }

    const displaySeconds =
      seconds === 0 && total >= 59000 ? Math.ceil(total / 1000) : seconds;

    return (
      <Typography
        variant="body2"
        sx={{
          fontSize: { xs: "0.875rem", sm: "1rem" },
          color: "rgba(255, 255, 255, 0.7)",
        }}
      >
        in {displaySeconds} sec
      </Typography>
    );
  };

  return (
    <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
      <Countdown date={date} renderer={renderer} onComplete={onComplete} />
    </Box>
  );
}
