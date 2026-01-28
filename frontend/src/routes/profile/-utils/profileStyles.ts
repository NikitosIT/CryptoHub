export const profileCard = {
  maxWidth: 500,
  width: "100%",
  textAlign: "center",
  p: { xs: 2.5, sm: 3, md: 4 },
  borderRadius: { xs: "12px", sm: "16px" },
  background: "linear-gradient(to bottom, #18181b, #000)",
  border: "1px solid #27272a",
};

export const profileEditCard = {
  p: 4,
  borderRadius: 3,
  background: "linear-gradient(to bottom, #1A1815, #18181b)",
  color: "white",
};

export const profileEmailBackground = {
  p: 1.5,
  borderRadius: 1,
  bgcolor: "rgba(255, 255, 255, 0.05)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "2px",
};

const duplicateStylesForProfile = {
  px: 2,
  py: 1.5,
  gap: 1.5,
  borderRadius: 2,
  color: "white",
  transition: "0.25s",
};

export const profileNickname = {
  mb: 1,
  letterSpacing: "0.5px",
  textAlign: "center",
  color: "#fb923c",
};

export const profileSettingName = {
  ...duplicateStylesForProfile,
  "&:hover": {
    bgcolor: "rgba(251,146,60,0.1)",
    color: "#fb923c",
  },
};

export const profileSecurity = {
  ...duplicateStylesForProfile,
  "&:hover": {
    bgcolor: "rgba(251,146,60,0.1)",
    color: "#fb735c",
  },
};

export const profileLikedPost = {
  ...duplicateStylesForProfile,
  "&:hover": {
    color: "#22cc55",
    backgroundColor: "rgba(49, 225, 70, 0.1)",
  },
};

export const profileDislikedPost = {
  ...duplicateStylesForProfile,
  "&:hover": {
    color: "#ef4444",
    backgroundColor: "rgba(247, 0, 27, 0.1)",
  },
};

export const profileNotifications = {
  ...duplicateStylesForProfile,
  "&:hover": {
    color: "#3b82f6",
    backgroundColor: "rgba(0, 118, 247, 0.1)",
  },
};

export const profileFavorites = {
  ...duplicateStylesForProfile,
  "&:hover": {
    color: "#fbbf24",
    backgroundColor: "rgba(247, 225, 0, 0.1)",
  },
};

export const profile2FaControllerStyles = {
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "rgba(255, 255, 255, 0.23)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(255, 255, 255, 0.4)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#fb923c",
    },
    "&.Mui-error fieldset": {
      borderColor: "#ef4444",
    },
  },
  "& .MuiInputLabel-root": {
    color: "rgba(255, 255, 255, 0.5)",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#fb923c",
  },
  "& .MuiInputLabel-root.Mui-error": {
    color: "#ef4444",
  },
  "& .MuiOutlinedInput-input": {
    color: "rgba(255, 255, 255, 0.9)",
  },
  "& .MuiFormHelperText-root": {
    color: "rgba(255, 255, 255, 0.6)",
  },
  "& .MuiFormHelperText-root.Mui-error": {
    color: "#ef4444",
  },
};

export const profile2FAWithCard = {
  width: "100%",
  p: 4,
  borderRadius: "16px",
  background: "linear-gradient(to bottom, #18181b, #000)",
  border: "1px solid #27272a",
  color: "#fff",
};

export const alertStylesProfile = {
  bgcolor: "rgba(239, 68, 68, 0.1)",
  color: "#ef4444",
  border: "1px solid rgba(239, 68, 68, 0.3)",
  "& .MuiAlert-icon": {
    color: "#ef4444",
  },
};

export const successAlertStylesProfile = {
  bgcolor: "rgba(34, 197, 94, 0.1)",
  color: "#22c55e",
  border: "1px solid rgba(34, 197, 94, 0.3)",
  "& .MuiAlert-icon": {
    color: "#22c55e",
  },
};

export const buttonQrlStyles = {
  backgroundColor: "#fb923c",
  "&:hover": { backgroundColor: "#f97316" },
  "&.Mui-disabled": {
    backgroundColor: "rgba(251, 146, 60, 0.5)",
    color: "rgba(255, 255, 255, 0.5)",
  },
};

export const qrlFormStyles = {
  width: 200,
  height: 200,
  borderRadius: 2,
  border: "1px solid #3f3f46",
  backgroundColor: "#fff",
  p: 1,
};

export const disableButtonStyles = {
  borderColor: "#f87171",
  color: "#f87171",
  "&:hover": {
    borderColor: "#ef4444",
    backgroundColor: "rgba(239,68,68,0.1)",
  },
};
