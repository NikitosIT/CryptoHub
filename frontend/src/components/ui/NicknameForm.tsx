import { type ReactNode } from "react";
import { Box, type SxProps, TextField, type Theme } from "@mui/material";

import { AuthButton } from "@/components/ui/AuthButton";
import { useNicknameForm } from "@/hooks/useNicknameForm";

export interface NicknameFormProps {
  title?: ReactNode;
  label?: string;
  buttonText?: string;
  loadingText?: string;
  defaultNickname?: string;
  onSuccess?: (nickname: string) => void;
  onError?: (error: Error) => void;
  resetOnSuccess?: boolean;
  containerSx?: SxProps<Theme>;
}

export function NicknameForm({
  title,
  label = "Nickname",
  buttonText = "Save",
  loadingText = "Saving...",
  defaultNickname = "",
  onSuccess,
  onError,
  resetOnSuccess = false,
  containerSx,
}: NicknameFormProps) {
  const {
    register,
    handleSubmit,
    errors,
    isPending,
    isDisabled,
    isError,
    error,
    canChangeNickname,
    nextChangeDate,
  } = useNicknameForm({
    defaultNickname,
    onSuccess,
    onError,
    resetOnSuccess,
  });

  return (
    <Box
      component="form"
      onSubmit={(e) => {
        void handleSubmit(e);
      }}
      display="flex"
      flexDirection="column"
      gap={2}
      sx={containerSx}
    >
      {title ? title : null}

      <TextField
        label={label}
        {...register("nickname")}
        error={!!errors.nickname || isError}
        helperText={errors.nickname?.message || error?.message || " "}
        fullWidth
        disabled={!canChangeNickname}
      />

      {!canChangeNickname && nextChangeDate ? (
        <Box
          sx={{
            fontSize: "0.875rem",
            color: "rgba(255, 255, 255, 0.7)",
            textAlign: "center",
          }}
        >
          Next nickname change available: {nextChangeDate}
        </Box>
      ) : null}

      <AuthButton
        type="submit"
        isLoading={isPending}
        loadingText={loadingText}
        disabled={isDisabled}
        fullWidth
      >
        {buttonText}
      </AuthButton>
    </Box>
  );
}
