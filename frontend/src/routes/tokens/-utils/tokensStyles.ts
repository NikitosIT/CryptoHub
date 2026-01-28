export const buttonForecastStyles = {
  backgroundColor: "#22c55e",
  color: "#fff",
  "&:hover": {
    backgroundColor: "#16a34a",
  },
  "&.Mui-disabled": {
    backgroundColor: "rgba(34, 197, 94, 0.5)",
    color: "rgba(255, 255, 255, 0.5)",
  },
};

export const forecastModalStyles = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  borderBottom: "1px solid #27272a",
  pb: 2,
  color: "#fff",
};

export const forecastModalItemStyles = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
  pt: 3,
  color: "#fff",
  overflowY: "auto",
  "&::-webkit-scrollbar": {
    width: "8px",
  },
  "&::-webkit-scrollbar-track": {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: "4px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: "4px",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.3)",
    },
  },
};

export const SENTIMENT_COLORS: Record<
  string,
  { bgcolor: string; color: string; border: string }
> = {
  positive: {
    bgcolor: "rgba(34, 197, 94, 0.1)",
    color: "#22c55e",
    border: "1px solid rgba(34, 197, 94, 0.3)",
  },
  negative: {
    bgcolor: "rgba(239, 68, 68, 0.1)",
    color: "#ef4444",
    border: "1px solid rgba(239, 68, 68, 0.3)",
  },
  neutral: {
    bgcolor: "rgba(156, 163, 175, 0.1)",
    color: "#9ca3af",
    border: "1px solid rgba(156, 163, 175, 0.3)",
  },
};

export const dialogPaperSx = {
  background: "linear-gradient(to bottom, #18181b, #000)",
  border: "1px solid #27272a",
  borderRadius: "16px",
  maxHeight: "80vh",
  display: "flex",
  flexDirection: "column",
};

export const closeButtonSx = {
  color: "#a1a1aa",
  "&:hover": {
    color: "#fff",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
};
