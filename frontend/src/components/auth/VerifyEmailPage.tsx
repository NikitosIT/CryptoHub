import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import HomeRedirectIcon from "./HomeRedirect";
import { codeSchema } from "@/lib/validatorSchemas";
import { useVerifyOtp } from "@/api/auth/useVerifyOtp";
import { useNavigate } from "@tanstack/react-router";
import ResendEmailCode from "./ResendEmailCode";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";

export default function VerifyEmailPage() {
  const [error, setError] = useState<string | null>(null);
  const { data: email } = useQuery<string | null>({
    queryKey: ["authEmail"],
    queryFn: async () => null,
    staleTime: Infinity,
    gcTime: Infinity,
  });
  const verifyOtp = useVerifyOtp();
  const navigate = useNavigate();

  // react-hook-form with zod
  const formSchema = useMemo(() => z.object({ code: codeSchema }), []);
  const {
    setValue,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<{ code: string }>({
    resolver: zodResolver(formSchema),
    defaultValues: { code: "" },
    mode: "onTouched",
  });

  const length = 6;
  const [digits, setDigits] = useState<string[]>(Array(length).fill(""));
  const inputsRef = useRef<Array<HTMLInputElement | null>>(
    Array(length).fill(null)
  );

  useEffect(() => {
    setValue("code", digits.join(""), { shouldValidate: true });
  }, [digits, setValue]);

  const focusIndex = (idx: number) => {
    inputsRef.current[idx]?.focus();
    inputsRef.current[idx]?.select();
  };

  const handleChange = (idx: number, val: string) => {
    const v = val.replace(/\D/g, "").slice(0, 1);
    setDigits((prev) => {
      const next = [...prev];
      next[idx] = v;
      return next;
    });
    if (v && idx < length - 1) focusIndex(idx + 1);
  };

  const handleKeyDown = (
    idx: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      if (digits[idx]) {
        setDigits((prev) => {
          const next = [...prev];
          next[idx] = "";
          return next;
        });
      } else if (idx > 0) {
        focusIndex(idx - 1);
      }
    }
    if (e.key === "ArrowLeft" && idx > 0) focusIndex(idx - 1);
    if (e.key === "ArrowRight" && idx < length - 1) focusIndex(idx + 1);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);
    if (!pasted) return;
    e.preventDefault();
    const arr = pasted.split("");
    setDigits(() => {
      const next = Array(length).fill("");
      for (let i = 0; i < Math.min(length, arr.length); i++) next[i] = arr[i];
      return next;
    });
    const nextIdx = Math.min(arr.length, length - 1);
    focusIndex(nextIdx);
  };

  const onSubmit = async ({ code }: { code: string }) => {
    setError(null);
    if (!email) {
      setError("Email не найден. Попробуйте заново войти.");
      return;
    }
    await verifyOtp.mutateAsync({ email, code });
    navigate({ to: "/auth/callback" });
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <HomeRedirectIcon />
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={600} textAlign="center" mb={3}>
          Подтверждение Email
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          display="flex"
          flexDirection="column"
          gap={2}
        >
          <Box display="flex" justifyContent="center" gap={1.5}>
            {Array.from({ length }).map((_, idx) => (
              <TextField
                key={idx}
                inputRef={(el) => (inputsRef.current[idx] = el)}
                value={digits[idx]}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) =>
                  handleKeyDown(idx, e as React.KeyboardEvent<HTMLInputElement>)
                }
                onPaste={idx === 0 ? handlePaste : undefined}
                inputProps={{
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                  maxLength: 1,
                  style: {
                    textAlign: "center",
                    fontSize: 24,
                    width: 48,
                    height: 56,
                  },
                }}
              />
            ))}
          </Box>
          {(errors.code?.message || error || verifyOtp.error?.message) && (
            <Typography color="error" textAlign="center" variant="body2">
              {errors.code?.message || error || verifyOtp.error?.message}
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={verifyOtp.isPending || !watch("code")}
          >
            {verifyOtp.isPending ? "Проверка..." : "Подтвердить"}
          </Button>
          <ResendEmailCode />
        </Box>
      </Paper>
    </Container>
  );
}
