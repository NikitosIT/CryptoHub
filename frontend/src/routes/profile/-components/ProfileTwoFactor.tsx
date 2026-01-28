import { type Control, Controller } from "react-hook-form";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import BackButton from "@/components/ui/BackButton";
import { useTwoFactorHook } from "@/routes/auth/-hooks/use2FAHook";
import { useAuthState } from "@/routes/auth/-hooks/useAuthState";

import {
  alertStylesProfile,
  buttonQrlStyles,
  disableButtonStyles,
  profile2FaControllerStyles,
  profile2FAWithCard,
  qrlFormStyles,
  successAlertStylesProfile,
} from "../-utils/profileStyles";

const statusAlertStyles = (enabled: boolean) => ({
  bgcolor: enabled ? "rgba(34, 197, 94, 0.1)" : "rgba(59, 130, 246, 0.1)",
  color: enabled ? "#22c55e" : "#3b82f6",
  border: `1px solid ${enabled ? "rgba(34, 197, 94, 0.3)" : "rgba(59, 130, 246, 0.3)"}`,
  "& .MuiAlert-icon": { color: enabled ? "#22c55e" : "#3b82f6" },
});

export default function ProfileTwoFactor() {
  const { isAuthenticatedWith2FA, user } = useAuthState({
    checkTwoFactor: true,
  });
  const twoFactor = useTwoFactorHook();

  if (!isAuthenticatedWith2FA || !user?.id) return null;

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      sx={{ px: 2, mt: 5 }}
    >
      <Box sx={{ maxWidth: 520, width: "100%" }}>
        <Box sx={{ mb: 2 }}>
          <BackButton />
        </Box>
        <Paper elevation={6} sx={profile2FAWithCard}>
          <Stack spacing={3}>
            <Typography variant="h5" fontWeight={600} sx={{ color: "white" }}>
              Two-Factor Authentication
            </Typography>

            {twoFactor.isLoading ? (
              <Box display="flex" justifyContent="center" sx={{ py: 5 }}>
                <CircularProgress size={32} />
              </Box>
            ) : (
              <>
                <Typography sx={{ color: "#a1a1aa", lineHeight: 1.6 }}>
                  Additional login verification will protect your account. After
                  enabling, use a code generator app (such as Google
                  Authenticator or Authy) to verify login.
                </Typography>

                <Alert
                  severity={twoFactor.isTwoFactorEnabled ? "success" : "info"}
                  sx={statusAlertStyles(twoFactor.isTwoFactorEnabled)}
                >
                  {twoFactor.isTwoFactorEnabled
                    ? "2FA enabled — a code from the app will be required when logging in."
                    : "2FA disabled — enable for additional protection."}
                </Alert>

                {twoFactor.errorMessage !== null && (
                  <Alert
                    severity="error"
                    onClose={() => twoFactor.setErrorMessage(null)}
                    sx={alertStylesProfile}
                  >
                    {twoFactor.errorMessage}
                  </Alert>
                )}

                {twoFactor.successMessage !== null && (
                  <Alert
                    severity="success"
                    onClose={() => twoFactor.setSuccessMessage(null)}
                    sx={successAlertStylesProfile}
                  >
                    {twoFactor.successMessage}
                  </Alert>
                )}

                {!twoFactor.isTwoFactorEnabled && (
                  <>
                    {twoFactor.qrUrl === null && (
                      <Button
                        variant="contained"
                        onClick={() => void twoFactor.handleStartSetup()}
                        disabled={twoFactor.isRequesting}
                        sx={buttonQrlStyles}
                      >
                        {twoFactor.isRequesting ? "Loading..." : "Enable 2FA"}
                      </Button>
                    )}

                    {twoFactor.qrUrl !== null && (
                      <QrCodeSetup
                        qrUrl={twoFactor.qrUrl}
                        control={twoFactor.control}
                        error={twoFactor.codeFormErrors.code?.message}
                        onSubmit={(e) => void twoFactor.handleConfirmSetup(e)}
                        isVerifying={twoFactor.isVerifying}
                      />
                    )}
                  </>
                )}

                {twoFactor.isTwoFactorEnabled === true && (
                  <Stack spacing={2}>
                    <Typography sx={{ color: "rgba(255, 255, 255, 0.9)" }}>
                      To disable 2FA, enter the current code from the app and
                      confirm the action.
                    </Typography>

                    {!twoFactor.disableMode ? (
                      <Button
                        variant="outlined"
                        onClick={twoFactor.handleEnableDisableMode}
                        sx={disableButtonStyles}
                      >
                        Disable 2FA
                      </Button>
                    ) : (
                      <DisableForm
                        control={twoFactor.control}
                        error={twoFactor.codeFormErrors.code?.message}
                        onSubmit={(e) => void twoFactor.handleDisableSubmit(e)}
                        onCancel={twoFactor.handleCancelDisable}
                        isDisabling={twoFactor.isDisabling}
                      />
                    )}
                  </Stack>
                )}
              </>
            )}
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}

// Sub-components

type CodeInputProps = {
  control: Control<{ code: string }>;
  error?: string;
};

function CodeInput({ control, error }: CodeInputProps) {
  return (
    <Controller
      control={control}
      name="code"
      render={({ field }) => (
        <TextField
          {...field}
          label="6-digit code"
          inputProps={{ inputMode: "numeric", maxLength: 6 }}
          fullWidth
          autoFocus
          error={Boolean(error)}
          helperText={error}
          sx={profile2FaControllerStyles}
        />
      )}
    />
  );
}

type QrCodeSetupProps = {
  qrUrl: string;
  control: Control<{ code: string }>;
  error?: string;
  onSubmit: (e: React.FormEvent) => void;
  isVerifying: boolean;
};

function QrCodeSetup({
  qrUrl,
  control,
  error,
  onSubmit,
  isVerifying,
}: QrCodeSetupProps) {
  return (
    <Stack spacing={2} alignItems="center">
      <Typography sx={{ color: "rgba(255, 255, 255, 0.9)" }}>
        Scan the QR code in the app:
      </Typography>

      <Box
        component="img"
        src={qrUrl}
        alt="QR code for 2FA"
        sx={qrlFormStyles}
      />

      <Typography variant="body2" sx={{ color: "#a1a1aa" }}>
        Then enter the code from the app to complete setup.
      </Typography>

      <Box component="form" onSubmit={onSubmit} sx={{ width: "100%" }}>
        <Stack spacing={2}>
          <CodeInput control={control} error={error} />
          <Button
            type="submit"
            variant="outlined"
            disabled={isVerifying}
            sx={buttonQrlStyles}
          >
            {isVerifying ? "Verifying..." : "Confirm"}
          </Button>
        </Stack>
      </Box>
    </Stack>
  );
}

type DisableFormProps = {
  control: Control<{ code: string }>;
  error?: string;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isDisabling: boolean;
};

function DisableForm({
  control,
  error,
  onSubmit,
  onCancel,
  isDisabling,
}: DisableFormProps) {
  return (
    <Box component="form" onSubmit={onSubmit}>
      <Stack spacing={2}>
        <CodeInput control={control} error={error} />
        <Stack direction="row" spacing={2}>
          <Button
            type="submit"
            variant="contained"
            disabled={isDisabling}
            sx={{
              backgroundColor: "#f87171",
              "&:hover": { backgroundColor: "#ef4444" },
            }}
          >
            {isDisabling ? "Disabling..." : "Confirm"}
          </Button>
          <Button
            variant="text"
            onClick={onCancel}
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
            }}
          >
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
