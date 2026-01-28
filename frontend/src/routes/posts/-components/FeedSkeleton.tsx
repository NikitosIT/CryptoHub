import { Box, Skeleton } from "@mui/material";

export default function FeedSkeleton() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        maxWidth: "42rem",
        mx: "auto",
        mt: 12,
        gap: 3,
      }}
    >
      {Array.from({ length: 3 }).map((_, i) => (
        <Box
          key={i}
          sx={{
            width: "100%",
            p: 2.5,
            border: "1px solid rgba(55, 65, 81, 0.5)",
            borderRadius: 2,
            bgcolor: "#171717",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Skeleton
            variant="rectangular"
            height={192}
            sx={{
              mb: 2,
              borderRadius: 1.5,
              bgcolor: "rgba(38, 38, 38, 0.8)",
            }}
          />
          <Skeleton
            variant="text"
            width="75%"
            height={12}
            sx={{
              mb: 1.5,
              bgcolor: "rgba(38, 38, 38, 0.8)",
            }}
          />
          <Skeleton
            variant="text"
            width="50%"
            height={12}
            sx={{
              mb: 1.5,
              bgcolor: "rgba(38, 38, 38, 0.8)",
            }}
          />
          <Skeleton
            variant="text"
            width="33%"
            height={12}
            sx={{
              bgcolor: "rgba(38, 38, 38, 0.8)",
            }}
          />
        </Box>
      ))}
    </Box>
  );
}
