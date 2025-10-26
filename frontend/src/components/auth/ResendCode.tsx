import { useState, useEffect } from "react";
import { Button, Typography } from "@mui/material";
import { supabase } from "@/lib/supabaseClient";

export default function ResendEmailCodePage() {
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<string | null>(null);

  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleResendCode = async () => {
    setCanResend(false);
    setTimeLeft(60);

    const email = sessionStorage.getItem("email");
    if (!email) return;

    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      console.error("Ошибка при повторной отправке:", error.message);
      setError("Не удалось отправить код. Попробуйте позже.");
      setCanResend(true);
    } else {
      setMessages("✅ Новый код отправлен на почту");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: 20 }}>
      <Typography variant="h6">
        Введите код, отправленный на ваш Email
      </Typography>

      {!canResend ? (
        <Typography sx={{ mt: 2, color: "black" }}>
          🔄 Повторная отправка будет доступна через {timeLeft} сек
        </Typography>
      ) : (
        <Button variant="outlined" onClick={handleResendCode}>
          Отправить код снова
        </Button>
      )}
      {error && (
        <Typography color="error" textAlign="center">
          {error}
        </Typography>
      )}
      {messages && (
        <Typography color="success.main" textAlign="center">
          {messages}
        </Typography>
      )}
    </div>
  );
}
