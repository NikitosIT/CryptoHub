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
              aria-hidden="true"
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
        </Paper>
      </Box>
    </Box>
  );
}
