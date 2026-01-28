import { type FieldErrors, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { z } from "zod";

import { useCountdown } from "@/hooks/useCountdown";
import { emailSchema } from "@/lib/validatorSchemas";
import { useSendEmail } from "@/routes/auth/-api/signInWithOtp";
import { validateRedirectTo } from "@/utils/redirectValidation";

type LoginFormValues = { email: string };

const loginFormSchema = z.object({ email: emailSchema });

type LoginSearchParams = {
  redirectTo?: string;
};

export function useLogin() {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const search = useSearch({ from: "/auth/" }) as LoginSearchParams;
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "" },
    mode: "onTouched",
  });

  const email = watch("email");
  const countdown = useCountdown({
    storageKey: email || undefined,
  });

  const sendCodeMutation = useSendEmail({
    onSuccess: (email) => {
      countdown.start();
      const safeRedirectTo = validateRedirectTo(search.redirectTo);
      void navigate({
        to: "/auth/verify",
        search: {
          email,
          mode: "email",
          ...(safeRedirectTo && { redirectTo: safeRedirectTo }),
        },
        replace: true,
      });
    },
  });

  const onSubmit = ({ email }: LoginFormValues) => {
    sendCodeMutation.mutate(email);
  };

  const formErrors: FieldErrors<LoginFormValues> = {
    email:
      errors.email ||
      (sendCodeMutation.error?.message
        ? {
            type: "server",
            message: sendCodeMutation.error.message,
          }
        : undefined),
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    formErrors,
    isPending: sendCodeMutation.isPending,
  };
}
