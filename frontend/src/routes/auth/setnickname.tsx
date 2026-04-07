import { Container, Paper, Typography } from '@mui/material';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

import { NicknameForm } from '@/components/ui/NicknameForm';
import { ROUTES } from '@/constants/routesPath';
import { createRouteGuard } from '@/hooks/routeGuards';

export const Route = createFileRoute(ROUTES.AUTH.SETNICKNAME)({
  beforeLoad: createRouteGuard({ requireAuth: true }),
  component: SetNickname,
});

function SetNickname() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Paper
        sx={{
          p: 4,
          borderRadius: 3,
          bgcolor: 'rgba(30, 30, 30, 0.8)',
          color: 'white',
        }}
      >
        <NicknameForm
          title={
            <Typography variant="h5" fontWeight={600} textAlign="center" sx={{ mb: 2 }}>
              Choose nickname
            </Typography>
          }
          buttonText="Continue"
          loadingText="Saving..."
          onSuccess={() => {
            navigate({ to: ROUTES.PROFILE.INDEX, replace: true });
          }}
        />
      </Paper>
    </Container>
  );
}
