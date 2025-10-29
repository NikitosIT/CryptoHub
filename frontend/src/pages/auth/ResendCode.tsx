import { useState, useEffect } from "react";
import { Button, Typography } from "@mui/material";
import { useUserStore } from "@/store/useUserStore";
import { useResendCode } from "@/api/auth/useResendCode";
import { useCountdown } from "@/hooks/useCountdown";

export default function ResendEmailCodePage() {
  const { email } = useUserStore();
  const resendCode = useResendCode();
  const [message, setMessage] = useState<string | null>(null);

  const { timeLeft, isActive, start, reset } = useCountdown(60, {
    autoStart: true,
    onComplete: () => console.log("⏰ Таймер завершён"),
  });

  useEffect(() => {
    if (!email) setMessage("Email не найден. Попробуйте заново войти.");
  }, [email]);

  const handleResend = async () => {
    if (!email) return;

    reset();
    start();

    try {
      await resendCode.mutateAsync(email);
      setMessage("✅ Новый код отправлен на почту");
    } catch (err: any) {
      setMessage(`❌ Ошибка: ${err.message}`);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: 20 }}>
      <Typography variant="h5">Подтверждение Email</Typography>
      <Typography color="white" sx={{ mb: 2 }}>
        {message || "Если письмо не пришло, можно отправить повторно"}
      </Typography>

      <Button
        variant="contained"
        disabled={isActive || resendCode.isPending}
        onClick={handleResend}
      >
        {isActive
          ? `Отправить повторно через ${timeLeft} сек`
          : resendCode.isPending
            ? "Отправка..."
            : "Отправить код снова"}
      </Button>
    </div>
  );
}
