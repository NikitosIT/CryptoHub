import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  Box,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";

import { useSessionQuery } from "@/api/useSessionQuery";
import BackButton from "@/components/ui/BackButton";
import { NicknameForm } from "@/components/ui/NicknameForm";
import { createRouteGuard } from "@/hooks/routeGuards";
import { useToast } from "@/hooks/useToast";
import ProfileLogo from "@/routes/profile/-components/ProfileLogo";

import {
  profileEditCard,
  profileEmailBackground,
} from "./-utils/profileStyles";

export const Route = createFileRoute("/profile/edit")({
  beforeLoad: createRouteGuard({ requireAuth: true }),
  component: ProfileEditName,
});

function ProfileEditName() {
  const { data: session } = useSessionQuery();
  const { showError, showSuccess } = useToast();

  return (
    <Stack alignItems="center" mt={10} px={2}>
      <Stack maxWidth={400} width="100%" spacing={2}>
        <Box sx={{ mb: 2 }}>
          <BackButton />
        </Box>
        <Paper sx={profileEditCard}>
          <Typography variant="h5" fontWeight={600} mb={3} textAlign="center">
            Profile Settings
          </Typography>

          {/* Avatar Section */}
          <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
            <ProfileLogo />
          </Box>

          <Divider sx={{ bgcolor: "rgba(255, 255, 255, 0.1)", mb: 3 }} />

          {/* User Info Section */}
          <Box mb={3}>
            <Typography
              variant="body2"
              sx={{ color: "rgba(255, 255, 255, 0.7)", mb: 1 }}
            >
              Email
            </Typography>

            <Box sx={profileEmailBackground}>
              <Typography>{session?.user.email || "Not specified"}</Typography>

              <Tooltip title="Copy email">
                <IconButton
                  size="small"
                  aria-label="Copy email"
                  onClick={() => {
                    if (session?.user.email) {
                      void navigator.clipboard.writeText(session.user.email);
                    }
                  }}
                  sx={{
                    color: "rgba(255,255,255,0.7)",
                    "&:hover": {
                      color: "#fb923c",
                    },
                  }}
                >
                  <ContentCopyIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Divider sx={{ bgcolor: "rgba(255, 255, 255, 0.1)", mb: 3 }} />

          {/* Nickname Form Section */}
          <Box>
            <Typography
              variant="body2"
              sx={{ color: "rgba(255, 255, 255, 0.7)", mb: 2 }}
            >
              Nickname
            </Typography>
            <NicknameForm
              label="New nickname"
              buttonText="Save"
              loadingText="Updating..."
              resetOnSuccess={true}
              onSuccess={() => {
                showSuccess("Nickname successfully updated!");
              }}
              onError={(err) => {
                showError(err.message || "Failed to update nickname");
              }}
            />
          </Box>
        </Paper>
      </Stack>
    </Stack>
  );
}
