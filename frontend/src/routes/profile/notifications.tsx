import NotificationsIcon from "@mui/icons-material/Notifications";
import { Box, Paper, Typography } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";

import BackButton from "@/components/ui/BackButton";
import { createRouteGuard } from "@/hooks/routeGuards";

export const Route = createFileRoute("/profile/notifications")({
  beforeLoad: createRouteGuard({ requireAuth: true }),
  component: Notifications,
});

function Notifications() {
  return (
    <Box component="main" display="flex" justifyContent="center" px={2} mt={10}>
      <Box width="100%" maxWidth={420}>
        <Box mb={2}>
          <BackButton />
        </Box>

        <Paper
          component="section"
          aria-labelledby="notifications-title"
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            bgcolor: "rgba(30, 30, 30, 0.8)",
            color: "white",
          }}
        >
          {/* Header */}
          <Box
            component="header"
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap={1.5}
            mb={3}
          >
            <NotificationsIcon
              sx={{ fontSize: { xs: 28, sm: 32 }, color: "#fb923c" }}
              aria-hidden
            />
            <Typography
              id="notifications-title"
              variant="h5"
              component="h1"
              fontWeight={600}
            >
              Notifications
            </Typography>
          </Box>

          {/* Content list */}
          <Box
            component="ul"
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: { xs: 2, sm: 2.5 },
              listStyle: "none",
              p: 0,
              m: 0,
            }}
          >
            <NotificationItem
              title="Stay Updated"
              text="Get notified about important updates, new features, and security alerts. We'll keep you informed about changes that matter to you."
            />

            <NotificationItem
              title="Comment Replies"
              text="Receive notifications when someone replies to your comments or mentions you in a discussion."
            />

            <NotificationItem
              title="Security Alerts"
              text="Important security notifications including login attempts, 2FA changes, and account activity will be sent to your email."
            />

            <NotificationItem
              title="Coming Soon"
              text="Notification preferences and in-app notifications are coming soon. You'll be able to customize what you want to be notified about."
            />
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
function NotificationItem({ title, text }: { title: string; text: string }) {
  return (
    <Box
      component="li"
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 2,
        bgcolor: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <Typography
        component="h3"
        variant="subtitle1"
        fontWeight={600}
        sx={{
          color: "#fb923c",
          mb: 1,
          fontSize: { xs: "14px", sm: "16px" },
        }}
      >
        {title}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: "rgba(255, 255, 255, 0.8)",
          fontSize: { xs: "13px", sm: "14px" },
          lineHeight: 1.6,
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}
