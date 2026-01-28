import React from "react";
import { type Control, Controller, type FieldErrors } from "react-hook-form";
import { Alert, Box, Stack, Typography } from "@mui/material";

import { AuthButton } from "@/components/ui/AuthButton";
import { StyledOtpInput } from "@/components/ui/StyledOtpInput";

type TwoFAFormValues = { code: string };

interface TwoFAFormProps {
  control: Control<TwoFAFormValues>;
  errors: FieldErrors<TwoFAFormValues>;
  isSubmitting: boolean;
  isCodeValid: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function TwoFAForm({
  control,
  errors,
  isSubmitting,
  isCodeValid,
  onSubmit,
}: TwoFAFormProps) {
  return (
    <>
      <Box
        display="flex"
        justifyContent="center"
        sx={{ mb: { xs: 1.5, sm: 2 } }}
      >
        <Box
          component="img"
          src="/others/google-authenticator.svg"
          alt="Google Authenticator"
          sx={{
            width: { xs: 48, sm: 56, md: 64 },
            height: { xs: 48, sm: 56, md: 64 },
            objectFit: "contain",
          }}
        />
      </Box>

      <Typography
        variant="h5"
        fontWeight={600}
        textAlign="center"
        sx={{
          color: "white",
          fontSize: { xs: "20px", sm: "24px" },
          mb: { xs: 1, sm: 0 },
        }}
      >
        Confirm login
      </Typography>

      <Typography
        variant="body2"
        textAlign="center"
        sx={{
          color: "rgba(255, 255, 255, 0.7)",
          fontSize: { xs: "12px", sm: "14px" },
          px: { xs: 1, sm: 0 },
        }}
      >
        Enter the 6-digit code from Google Authenticator (or another generator)
        to complete login.
      </Typography>

      {errors.code?.message ? (
        <Alert
          severity="error"
          sx={{
            bgcolor: "rgba(239, 68, 68, 0.1)",
            color: "#ef4444",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            fontSize: { xs: "12px", sm: "14px" },
            "& .MuiAlert-icon": {
              color: "#ef4444",
            },
          }}
        >
          {errors.code.message}
        </Alert>
      ) : null}

      <Box component="form" onSubmit={onSubmit}>
        <Stack spacing={{ xs: 1.5, sm: 2 }}>
          <Box
            display="flex"
            justifyContent="center"
            sx={{ py: { xs: 1.5, sm: 2 } }}
          >
            <Controller
              control={control}
              name="code"
              render={({ field }) => (
                <StyledOtpInput value={field.value} onChange={field.onChange} />
              )}
            />
          </Box>

          <AuthButton
            type="submit"
            isLoading={isSubmitting}
            loadingText="Verifying..."
            disabled={!isCodeValid}
            fullWidth
          >
            Confirm
          </AuthButton>
        </Stack>
      </Box>

      <Typography
        variant="body2"
        textAlign="center"
        sx={{
          color: "rgba(255, 255, 255, 0.7)",
          mt: { xs: 1.5, sm: 2 },
          fontSize: { xs: "12px", sm: "14px" },
          px: { xs: 1, sm: 0 },
        }}
      >
        No access to the app? Contact support to disable 2FA.
      </Typography>
    </>
  );
}
