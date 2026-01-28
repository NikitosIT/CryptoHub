import { type Control, type FieldErrors, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodString } from "zod";
import { z } from "zod";

type CodeFormValues = { code: string };

interface UseCodeFormOptions {
  schema: ZodString;
}

export function useCodeForm({ schema }: UseCodeFormOptions) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
    reset,
  } = useForm<CodeFormValues>({
    resolver: zodResolver(z.object({ code: schema })),
    defaultValues: { code: "" },
    mode: "onTouched",
  });

  const codeValue = watch("code");

  const codeFormErrors: FieldErrors<CodeFormValues> = { code: errors.code };

  return {
    control: control as Control<CodeFormValues>,
    codeFormErrors,
    codeValue,
    handleSubmit,
    setError,
    reset,
  };
}
