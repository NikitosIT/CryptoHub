import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { nicknameSchema } from "@/lib/validatorSchemas";
import { useUpdateProfile } from "@/routes/profile/-api/useUpdateProfile";
import { useUserProfile } from "@/routes/profile/-api/useUserProfile";
import { getErrorMessage } from "@/utils/errorUtils";

import { useRequiredAuth } from "./useRequiredAuth";

type NicknameFormValues = { nickname: string };

const formSchema = z.object({ nickname: nicknameSchema });

const DAYS_BETWEEN_CHANGES = 14;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

function calculateNicknameChangeStatus(lastChanged: string | null) {
  if (!lastChanged) {
    return { canChange: true, nextChangeDate: null };
  }

  const lastChangedDate = new Date(lastChanged);
  const now = new Date();
  const daysSinceChange = Math.floor(
    (now.getTime() - lastChangedDate.getTime()) / MS_PER_DAY,
  );

  const nextDate = new Date(lastChangedDate);
  nextDate.setDate(nextDate.getDate() + DAYS_BETWEEN_CHANGES);

  return {
    canChange: daysSinceChange >= DAYS_BETWEEN_CHANGES,
    nextChangeDate: formatDate(nextDate),
  };
}

interface UseNicknameFormProps {
  defaultNickname?: string;
  onSuccess?: (nickname: string) => void;
  onError?: (error: Error) => void;
  resetOnSuccess?: boolean;
}

export function useNicknameForm({
  defaultNickname = "",
  onSuccess,
  onError,
  resetOnSuccess = false,
}: UseNicknameFormProps) {
  const { user } = useRequiredAuth();
  const mutation = useUpdateProfile();
  const { data: profile } = useUserProfile();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
    setError: setFormError,
  } = useForm<NicknameFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { nickname: defaultNickname },
    mode: "onTouched",
  });

  const { canChange: canChangeNickname, nextChangeDate } = useMemo(
    () => calculateNicknameChangeStatus(profile?.last_changed ?? null),
    [profile?.last_changed],
  );

  const onSubmit = async ({ nickname }: NicknameFormValues) => {
    try {
      await mutation.mutateAsync({ nickname });
      if (resetOnSuccess) {
        reset({ nickname: "" });
      }
      onSuccess?.(nickname);
    } catch (err) {
      const errorMessage = getErrorMessage(err, "Error saving");
      setFormError("nickname", { message: errorMessage });
      onError?.(new Error(errorMessage));
    }
  };

  const nicknameValue = watch("nickname");
  const isPending = mutation.isPending || isSubmitting;
  const isDisabled =
    isPending || !nicknameValue || !user.id || !canChangeNickname;

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isPending,
    isDisabled,
    isError: mutation.isError,
    error: mutation.error,
    canChangeNickname,
    nextChangeDate,
  };
}
