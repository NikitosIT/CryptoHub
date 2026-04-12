import { useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from '@tanstack/react-router';

import { api } from '@/api';
import { persister } from '@/main';
import { twoFactorStatusQueryKey } from '@/routes/auth/-api/use2faApi';

export function useHeaderNavigation() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const queryClient = useQueryClient();

  const isOnVerificationPage = pathname.startsWith('/auth/verify');

  const clearAuthState = async () => {
    try {
      await api.twoFactor.clearVerification();
    } catch (e) {
      console.error('Failed to clear 2FA verification:', e);
    }

    void queryClient.invalidateQueries({
      queryKey: twoFactorStatusQueryKey(),
    });

    persister.removeClient();
    queryClient.clear();

    try {
      await api.auth.signOut();
    } catch (e) {
      console.error('Failed to sign out:', e);
    }
  };

  const handleLoginClick = async (e: React.MouseEvent) => {
    if (!isOnVerificationPage) return;

    e.preventDefault();

    await clearAuthState();

    void navigate({ to: '/auth', replace: true });
  };

  return {
    handleLoginClick,
    isOnVerificationPage,
  };
}
