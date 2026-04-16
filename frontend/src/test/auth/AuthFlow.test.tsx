/* eslint-disable @typescript-eslint/no-unsafe-return */

import type React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { api as apiClient } from '@/api';
import { Verify2FAPage } from '@/routes/auth/-components/Verify2FAPage';
import { EmailAuth } from '@/routes/auth/index';
import { VerifyEmailPage } from '@/routes/auth/verify';
import { ProfileMain } from '@/routes/profile/index';
const mockSignInWithOtp = vi.fn();
const mockVerifyOtp = vi.fn();

const mockGetTwoFactorStatus = vi.fn();
vi.mock('@/api', async (importOriginal) => {
  const mod = await importOriginal();
  const typedMod = mod as { api: typeof apiClient };

  return {
    ...typedMod,
    api: {
      ...typedMod.api,
      auth: {
        ...typedMod.api.auth,
        signInWithOtp: (email: string) => mockSignInWithOtp(email),
        verifyOtp: (email: string, code: string) => mockVerifyOtp(email, code),
      },
      twoFactor: {
        ...typedMod.api.twoFactor,
        getStatus: () => mockGetTwoFactorStatus(),
      },
    },
  };
});

const mockNavigate = vi.fn();
vi.mock('@tanstack/react-router', async (importOriginal) => {
  const mod = await importOriginal();
  if (typeof mod !== 'object' || mod === null) {
    return mod;
  }

  return {
    ...mod,
    useNavigate: () => mockNavigate,
    useSearch(opts: { from: string }) {
      const { from } = opts as { from?: string };
      if (from === '/auth/verify') return mockVerifySearch();
      if (from === '/auth/') return mockLoginSearch();
      if (from === '/auth/callback') return mockCallbackSearch();
      return {};
    },
  };
});

const mockVerifySearch = vi.fn(() => ({}));
const mockLoginSearch = vi.fn(() => ({}));
const mockCallbackSearch = vi.fn(() => ({}));

const mockUseAuthState = vi.fn();
vi.mock('@/routes/auth/-hooks/useAuthState', () => ({
  useAuthState: (opts: unknown) => mockUseAuthState(opts),
}));

vi.mock('@/main', () => ({
  persister: { removeClient: vi.fn() },
  queryClient: {},
}));

vi.mock('@/routes/auth/-components/AuthGoogle', () => ({
  default: () => <div data-testid="auth-google">Google</div>,
}));

vi.mock('@/api/useSessionQuery', () => ({
  useSessionQuery: () => ({
    data: { user: { email: 'u@test.com' } },
    isPending: false,
    isFetching: false,
  }),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return { Wrapper, queryClient };
}

describe('Auth flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignInWithOtp.mockImplementation(async (email: string) => Promise.resolve(email));
    mockVerifyOtp.mockResolvedValue({ user: { id: 'user-1' } });
    mockGetTwoFactorStatus.mockResolvedValue({
      enabled: false,
      is_verified_for_current_session: true,
    });
    mockLoginSearch.mockReturnValue({});
    mockVerifySearch.mockReturnValue({ email: null, mode: undefined });
    mockUseAuthState.mockReturnValue({
      user: undefined,
      isLoading: false,
      hasPendingTwoFactor: false,
      isAuthenticatedWith2FA: false,
    });
  });

  describe('Email login → OTP request → verify page', () => {
    it('when user enters email and clicks Get code, signInWithOtp is called and app navigates to verify with email and mode', async () => {
      const { Wrapper } = createWrapper();

      render(
        <Wrapper>
          <EmailAuth />
        </Wrapper>,
      );

      const email = 'user@example.com';
      await userEvent.type(screen.getByRole('textbox', { name: /email/i }), email);
      await userEvent.click(screen.getByRole('button', { name: /get code/i }));

      await waitFor(() => {
        expect(mockSignInWithOtp).toHaveBeenCalledTimes(1);
        expect(mockSignInWithOtp).toHaveBeenCalledWith(email);
      });
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '/auth/verify',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          search: expect.objectContaining({
            email,
            mode: 'email',
          }),
          replace: true,
        }),
      );
    });
  });

  describe('Verify page', () => {
    it('when on verify with email and mode, user sees Confirm Email form and can submit code', async () => {
      mockVerifySearch.mockReturnValue({
        email: 'user@example.com',
        mode: 'email',
      });
      mockUseAuthState.mockReturnValue({
        user: undefined,
        isLoading: false,
        hasPendingTwoFactor: false,
        isAuthenticatedWith2FA: false,
      });

      const { Wrapper } = createWrapper();

      render(
        <Wrapper>
          <VerifyEmailPage />
        </Wrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText('Confirm Email')).toBeInTheDocument();
      });
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    });

    it('when user confirms code and 2FA is enabled (pending), verifyOtp is called and app navigates to verify-2fa', async () => {
      const email = 'user@example.com';
      mockVerifySearch.mockReturnValue({ email, mode: 'email' });
      mockUseAuthState
        .mockReturnValueOnce({
          user: undefined,
          isLoading: false,
          hasPendingTwoFactor: false,
          isAuthenticatedWith2FA: false,
        })
        .mockReturnValue({
          user: { id: 'user-1' },
          isLoading: false,
          hasPendingTwoFactor: true,
          isAuthenticatedWith2FA: false,
        });

      const { Wrapper } = createWrapper();

      render(
        <Wrapper>
          <VerifyEmailPage />
        </Wrapper>,
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
      });

      const codeInputs = document.querySelectorAll<HTMLInputElement>(
        'input[inputmode="numeric"]',
      );

      expect(codeInputs.length).toBeGreaterThanOrEqual(6);
      await userEvent.type(codeInputs[0]!, '1');
      await userEvent.type(codeInputs[1]!, '2');
      await userEvent.type(codeInputs[2]!, '3');
      await userEvent.type(codeInputs[3]!, '4');
      await userEvent.type(codeInputs[4]!, '5');
      await userEvent.type(codeInputs[5]!, '6');
      await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));

      await waitFor(() => {
        expect(mockVerifyOtp).toHaveBeenCalledWith(email, '123456');
      });
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '/auth/verify-2fa',
          replace: true,
        }),
      );
    });

    it('when user confirms code and 2FA is not enabled, verifyOtp is called and app navigates to callback', async () => {
      const email = 'user@example.com';
      mockVerifySearch.mockReturnValue({ email, mode: 'email' });
      mockUseAuthState
        .mockReturnValueOnce({
          user: undefined,
          isLoading: false,
          hasPendingTwoFactor: false,
          isAuthenticatedWith2FA: false,
        })
        .mockReturnValue({
          user: { id: 'user-1' },
          isLoading: false,
          hasPendingTwoFactor: false,
          isAuthenticatedWith2FA: true,
        });

      const { Wrapper } = createWrapper();

      render(
        <Wrapper>
          <VerifyEmailPage />
        </Wrapper>,
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
      });

      const codeInputs = document.querySelectorAll('input[inputmode="numeric"]');
      expect(codeInputs.length).toBeGreaterThanOrEqual(6);
      for (let i = 0; i < 6; i++)
        // eslint-disable-next-line no-await-in-loop
        await userEvent.type(codeInputs[i]!, String(i + 1));
      await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));

      await waitFor(() => {
        expect(mockVerifyOtp).toHaveBeenCalledWith(email, '123456');
      });
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '/auth/callback',
          replace: true,
        }),
      );
    });
  });

  describe('Target pages render', () => {
    it('Verify2FAPage renders 2FA form', () => {
      mockUseAuthState.mockReturnValue({
        user: { id: 'user-1' },
        isLoading: false,
        hasPendingTwoFactor: true,
        isAuthenticatedWith2FA: false,
      });

      const { Wrapper } = createWrapper();

      render(
        <Wrapper>
          <Verify2FAPage />
        </Wrapper>,
      );

      expect(
        screen.getByRole('img', { name: /google authenticator/i }),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    });

    it('Profile page renders menu with Settings and Security', async () => {
      const { Wrapper } = createWrapper();

      render(
        <Wrapper>
          <ProfileMain />
        </Wrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText('Settings Profile')).toBeInTheDocument();
      });
      expect(screen.getByText('Security')).toBeInTheDocument();
    });
  });
});
