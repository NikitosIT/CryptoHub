import { type FieldErrors, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { emailSchema } from "@/lib/validatorSchemas";
import { useSendEmail } from "@/routes/auth/-api/signInWithOtp";

type LoginFormValues = { email: string };

const loginFormSchema = z.object({ email: emailSchema });

export function useLogin() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "" },
    mode: "onTouched",
  });

  const sendCodeMutation = useSendEmail({
    onSuccess: (email) => {
      void navigate({
        to: "/auth/verify",
        search: {
          email,
          mode: "email",
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
