import { type Control, Controller, type FieldErrors } from "react-hook-form";
import { Box, Typography } from "@mui/material";

import { AuthButton } from "@/components/ui/AuthButton";
import { StyledOtpInput } from "@/components/ui/StyledOtpInput";

import ResendEmailCode from "./ResendEmailCode";

type OtpFormValues = { code: string };

interface OtpFormProps {
  control: Control<OtpFormValues>;
  errors: FieldErrors<OtpFormValues>;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  disabled?: boolean;
}

export function OtpForm({
  control,
  errors,
  isSubmitting,
  onSubmit,
  disabled = false,
}: OtpFormProps) {
  return (
    <Box>
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
        Confirm Email
      </Typography>

      <Box
        component="form"
        onSubmit={onSubmit}
        display="flex"
        flexDirection="column"
        gap={{ xs: 1.5, sm: 2 }}
      >
        <Box
          display="flex"
          justifyContent="center"
          sx={{ py: { xs: 1.5, sm: 2 } }}
        >
          <Controller
            control={control}
            name="code"
            render={({ field }) => (
              <StyledOtpInput
                value={field.value}
                onChange={field.onChange}
                disabled={disabled}
              />
            )}
          />
        </Box>

        {errors.code?.message ? (
          <Typography
            color="error"
            textAlign="center"
            variant="body2"
            sx={{
              color: "#ef4444",
              fontSize: { xs: "12px", sm: "14px" },
            }}
          >
            {errors.code.message}
          </Typography>
        ) : null}

        <AuthButton
          type="submit"
          isLoading={isSubmitting}
          loadingText="Checking..."
          disabled={disabled}
        >
          {disabled ? "Confirmed" : "Confirm"}
        </AuthButton>

        {!disabled && <ResendEmailCode />}
      </Box>
    </Box>
  );
}
