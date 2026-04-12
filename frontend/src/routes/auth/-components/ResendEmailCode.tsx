import { Box, Stack, Typography } from '@mui/material';
import { useSearch } from '@tanstack/react-router';

import { AuthButton } from '@/components/ui/AuthButton';
import { useCountdown } from '@/hooks/useCountdown';
import { useResendEmailCode } from '@/routes/auth/-hooks/useResendEmailCode';
import type { NullableEmail } from '@/types';

import { CountdownDisplay } from './CountdownDisplay';

export default function ResendEmailCode() {
  const search = useSearch({ from: '/auth/verify' });
  const email: NullableEmail = search.email ?? null;

  const countdown = useCountdown({
    storageKey: email || undefined,
  });
  const { resend, isPending } = useResendEmailCode({
    onSuccess: () => {
      countdown.start();
    },
  });
  const handleResend = () => {
    void resend(email ?? null);
  };

  const buttonText = isPending
    ? 'Sending...'
    : countdown.isActive
      ? 'Resend'
      : 'Send code again';

  return (
    <Box sx={{ textAlign: 'center', mt: 3 }}>
      <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.7)' }}>
        If the email didn&apos;t arrive, you can resend it
      </Typography>

      <Stack spacing={1} alignItems="center">
        <AuthButton
          size="large"
          disabled={countdown.isActive || isPending || !email}
          onClick={handleResend}
        >
          {buttonText}
        </AuthButton>
        {countdown.isActive && countdown.countdownDate ? (
          <CountdownDisplay
            date={countdown.countdownDate}
            onComplete={countdown.handleComplete}
          />
        ) : null}
      </Stack>
    </Box>
  );
}
