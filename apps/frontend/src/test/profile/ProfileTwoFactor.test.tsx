/* eslint-disable @typescript-eslint/no-unsafe-return */
import type React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { api as apiClient } from '@/api';
import ProfileTwoFactor from '@/routes/profile/-components/ProfileTwoFactor';

const mockGetStatus = vi.fn();
const mockEnable = vi.fn();
const mockVerifySetup = vi.fn();
const mockDisable = vi.fn();

vi.mock('@/api', async (importOriginal) => {
  const mod = await importOriginal();
  const typedMod = mod as { api: typeof apiClient };
  return {
    ...typedMod,
    api: {
      ...typedMod.api,
      twoFactor: {
        ...typedMod.api.twoFactor,
        getStatus: () => mockGetStatus(),
        enable: () => mockEnable(),
        verifySetup: (code: string) => mockVerifySetup(code),
        disable: (code: string) => mockDisable(code),
      },
    },
  };
});

const mockUseAuthState = vi.fn();
vi.mock('@/routes/auth/-hooks/useAuthState', () => ({
  useAuthState: (opts: unknown) => mockUseAuthState(opts),
}));

const MOCK_QR_URL = 'https://example.com/2fa-qr.png';

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

describe('ProfileTwoFactor (2FA)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthState.mockReturnValue({
      isAuthenticatedWith2FA: true,
      user: { id: 'user-1', email: 'u@test.com' },
    });
    mockGetStatus.mockResolvedValue({
      enabled: false,
      is_verified_for_current_session: false,
    });
    mockEnable.mockResolvedValue({ qrUrl: MOCK_QR_URL });
    mockVerifySetup.mockResolvedValue({ success: true });
    mockDisable.mockResolvedValue({ success: true });
  });

  it('when user clicks Enable 2FA, enable-2fa is called and UI shows QR setup (QR image, code input, Confirm)', async () => {
    const { Wrapper } = createWrapper();

    render(
      <Wrapper>
        <ProfileTwoFactor />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /enable 2fa/i })).toBeInTheDocument();
    });

    expect(mockEnable).not.toHaveBeenCalled();

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /enable 2fa/i }));

    await waitFor(() => {
      expect(mockEnable).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByText('Scan the QR code in the app:')).toBeInTheDocument();
    });
    const qrImg = screen.getByRole('img', { name: /qr code for 2fa/i });
    expect(qrImg).toBeInTheDocument();
    expect(qrImg).toHaveAttribute('src', MOCK_QR_URL);
    expect(
      screen.getByText('Then enter the code from the app to complete setup.'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/6-digit code/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
  });

  it('when user enters code and clicks Confirm, verify-2fa-setup is called and UI shows success and 2FA enabled state', async () => {
    const { Wrapper } = createWrapper();

    render(
      <Wrapper>
        <ProfileTwoFactor />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /enable 2fa/i })).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /enable 2fa/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    });

    const codeInput = screen.getByLabelText(/6-digit code/i);
    await user.type(codeInput, '123456');
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => {
      expect(mockVerifySetup).toHaveBeenCalledTimes(1);
      expect(mockVerifySetup).toHaveBeenCalledWith('123456');
    });

    await waitFor(() => {
      expect(screen.getByText('2FA successfully enabled!')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByText(/2FA enabled — a code from the app will be required/i),
      ).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /disable 2fa/i })).toBeInTheDocument();
  });

  it('when 2FA is enabled, user can open disable mode and submit code to disable', async () => {
    mockGetStatus.mockResolvedValue({
      enabled: true,
      is_verified_for_current_session: true,
    });

    const { Wrapper } = createWrapper();

    render(
      <Wrapper>
        <ProfileTwoFactor />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /disable 2fa/i })).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /disable 2fa/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/6-digit code/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/6-digit code/i), '654321');
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => {
      expect(mockDisable).toHaveBeenCalledWith('654321');
    });
    await waitFor(() => {
      expect(screen.getByText('2FA disabled.')).toBeInTheDocument();
    });
  });

  it('shows Loading while status is loading', () => {
    let resolve!: () => void;

    const pendingPromise = new Promise<void>((res) => {
      resolve = res;
    });

    mockGetStatus.mockReturnValue(pendingPromise);
    resolve();

    const { Wrapper } = createWrapper();

    render(
      <Wrapper>
        <ProfileTwoFactor />
      </Wrapper>,
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
