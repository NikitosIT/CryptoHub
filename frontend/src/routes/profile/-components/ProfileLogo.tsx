import { Box, Button } from "@mui/material";

import { UserAvatar } from "@/components/ui/UserAvatar";

import { useUploadProfileLogo } from "../-api/useUploadProfileLogo";

export default function ProfileLogo() {
  const { uploadLogo, isUploading } = useUploadProfileLogo();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadLogo(file).catch((error) => {
      console.error("Failed to upload profile logo:", error);
    });
  };
  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
      <UserAvatar size={100} showSkeleton={true} />

      <Button
        variant="outlined"
        component="label"
        disabled={isUploading}
        sx={{
          borderColor: "#fb923c",
          color: "#fb923c",
          textTransform: "none",
          "&:hover": {
            borderColor: "#f97316",
            backgroundColor: "rgba(251, 146, 60, 0.1)",
          },
        }}
      >
        {isUploading ? "Loading..." : "Change photo"}
        <input type="file" accept="image/*" hidden onChange={handleChange} />
      </Button>
    </Box>
  );
}
