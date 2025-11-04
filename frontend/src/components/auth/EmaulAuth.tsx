import { useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { emailSchema } from "@/lib/validatorSchemas";
import { useQueryClient } from "@tanstack/react-query";
import AuthGoogle from "@/components/auth/AuthGoogle";
import HomeRedirectIcon from "./HomeRedirect";
import { useSendEmail } from "@/api/auth/useSendEmail";

export default function EmailAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const sendCodeMutation = useSendEmail();
  const formSchema = useMemo(() => z.object({ email: emailSchema }), []);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<{ email: string }>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
    mode: "onTouched",
  });

  const onSubmit = async ({ email }: { email: string }) => {
    try {
      await sendCodeMutation.mutateAsync(email);
      queryClient.setQueryData(["authEmail"], email);
      console.log("before");
      navigate({ to: "/auth/verify" });
      console.log("after");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <AuthGoogle />
      <HomeRedirectIcon />
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={600} textAlign="center" mb={3}>
          Вход по Email
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          display="flex"
          flexDirection="column"
          gap={2}
        >
          <TextField
            label="Email"
            type="email"
            {...register("email")}
            error={!!errors.email || sendCodeMutation.isError}
            helperText={
              errors.email?.message || sendCodeMutation.error?.message || ""
            }
            fullWidth
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={sendCodeMutation.isPending || !watch("email")}
          >
            {sendCodeMutation.isPending ? "Отправка..." : "Получить код"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

//AuthWithEmail
