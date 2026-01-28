import { Box, Skeleton } from "@mui/material";

export default function FilterSkeleton() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        maxWidth: "28rem",
        mx: "auto",
        mt: 8,
        gap: 2,
      }}
    >
      <Skeleton
        variant="rectangular"
        height={56}
        sx={{
          width: {
            xs: "100%",
            sm: 260,
            md: 280,
          },
          borderRadius: 1,
          bgcolor: "rgba(38, 38, 38, 0.8)",
        }}
      />
    </Box>
  );
}
