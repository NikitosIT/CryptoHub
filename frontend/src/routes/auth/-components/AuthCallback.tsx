import { Box, CircularProgress, Typography } from "@mui/material";

import { useAuthCallback } from "../-hooks/useAuthCallback";

export default function AuthCallback() {
  const { isLoading, isProfileError } = useAuthCallback();

  if (isLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={3}
        sx={{
          height: "100vh",
          bgcolor: "black",
          color: "white",
        }}
      >
        <CircularProgress sx={{ color: "#fb923c" }} />
        <Typography variant="body1" sx={{ fontSize: { xs: "1rem", sm: "1.125rem" } }}>
          Check profile...
        </Typography>
      </Box>
    );
  }

  if (isProfileError) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{
          height: "100vh",
          bgcolor: "black",
          color: "#ef4444",
          fontSize: "0.875rem",
        }}
      >
        Profile loading failed. Redirecting…
      </Box>
    );
  }

  return null;
}
