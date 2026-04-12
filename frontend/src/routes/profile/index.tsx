import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import { Box, Divider, List, ListItemButton, Paper, Typography } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';
import { EditIcon } from 'lucide-react';

import { UserAvatar } from '@/components/ui/UserAvatar';
import { createRouteGuard } from '@/hooks/routeGuards';
import { useSessionQuery } from '@/routes/auth/-api/useSessionQuery';
import { useUserProfile } from '@/routes/profile/-api/useUserProfile';
import { LogoutButton } from '@/routes/profile/-components/LogoutButton';

import {
  profileCard,
  profileDislikedPost,
  profileFavorites,
  profileLikedPost,
  profileNickname,
  profileNotifications,
  profileSecurity,
  profileSettingName,
} from './-utils/profileStyles';

export const Route = createFileRoute('/profile/')({
  beforeLoad: createRouteGuard({
    requireAuth: true,
    redirectTo: '/auth',
  }),
  component: ProfileMain,
});

export function ProfileMain() {
  const navigate = useNavigate();

  const { data: profile } = useUserProfile();
  const { data: session } = useSessionQuery();

  return (
    <div className="flex flex-col items-center justify-center px-2 mt-6 sm:px-4 sm:mt-8 md:mt-10">
      <Paper elevation={6} sx={profileCard}>
        <Typography variant="h5" sx={profileNickname}>
          {profile?.nickname || session?.user.email?.split('@')[0] || 'User'}
        </Typography>

        <Box display="flex" justifyContent="center" sx={{ mb: 3 }}>
          <UserAvatar size={100} showSkeleton={true} />
        </Box>
        <List sx={{ color: '#fff' }}>
          <ListItemButton
            onClick={() => void navigate({ to: '/profile/edit' })}
            sx={profileSettingName}
          >
            <EditIcon width={20} height={20} />
            <Typography fontSize="0.95rem" fontWeight={500}>
              Settings Profile
            </Typography>
          </ListItemButton>

          <Divider sx={{ backgroundColor: '#3f3f46', my: 0.5 }} />

          <ListItemButton
            onClick={() => void navigate({ to: '/profile/twofactor' })}
            sx={profileSecurity}
          >
            <SecurityIcon sx={{ fontSize: 20 }} />
            <Typography fontSize="0.95rem" fontWeight={500}>
              Security
            </Typography>
          </ListItemButton>

          <Divider sx={{ backgroundColor: '#3f3f46', my: 0.5 }} />
          <ListItemButton
            sx={profileNotifications}
            onClick={() => void navigate({ to: '/profile/notifications' })}
          >
            <NotificationsIcon sx={{ fontSize: 20 }} />
            <Typography fontSize="0.95rem" fontWeight={500}>
              Notifications
            </Typography>
          </ListItemButton>

          <Divider sx={{ backgroundColor: '#3f3f46', my: 0.5 }} />
          <ListItemButton
            sx={profileLikedPost}
            onClick={() => void navigate({ to: '/posts', search: { mode: 'liked' } })}
          >
            <FavoriteBorderIcon sx={{ fontSize: 20 }} />
            <Typography fontSize="0.95rem" fontWeight={500}>
              Liked Posts
            </Typography>
          </ListItemButton>
          <Divider sx={{ backgroundColor: '#3f3f46', my: 0.5 }} />

          <ListItemButton
            sx={profileDislikedPost}
            onClick={() => void navigate({ to: '/posts', search: { mode: 'disliked' } })}
          >
            <ThumbDownOffAltIcon sx={{ fontSize: 20 }} />
            <Typography fontSize="0.95rem" fontWeight={500}>
              Dislikes Posts
            </Typography>
          </ListItemButton>

          <Divider sx={{ backgroundColor: '#3f3f46', my: 0.5 }} />

          <ListItemButton
            sx={profileFavorites}
            onClick={() => void navigate({ to: '/posts', search: { mode: 'favorites' } })}
          >
            <BookmarkBorderIcon sx={{ fontSize: 20 }} />
            <Typography fontSize="0.95rem" fontWeight={500}>
              Favorites Posts
            </Typography>
          </ListItemButton>
        </List>
        <LogoutButton />
      </Paper>
    </div>
  );
}
