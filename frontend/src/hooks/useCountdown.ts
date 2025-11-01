import { useEffect, useRef, useState } from "react";

interface UseCountdownOptions {
    autoStart?: boolean;
    onComplete?: () => void;
}

export function useCountdown(
    initialSeconds: number = 60,
    options: UseCountdownOptions = {},
) {
    const [timeLeft, setTimeLeft] = useState(initialSeconds);
    const [isActive, setIsActive] = useState(false);
    const timerRef = useRef<number | null>(null);

    // ▶️ Запуск таймера
    const start = (seconds: number = initialSeconds) => {
        if (timerRef.current) clearInterval(timerRef.current);
        setTimeLeft(seconds);
        setIsActive(true);
    };

    // ⏹️ Остановка
    const stop = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsActive(false);
    };

    // 🔁 Сброс
    const reset = () => {
        stop();
        setTimeLeft(initialSeconds);
    };

    // ⏱️ Сам отсчёт
    useEffect(() => {
        if (!isActive) return;

        timerRef.current = window.setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    setIsActive(false);
                    options.onComplete?.();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isActive, options.onComplete]);

    // 🚀 Автостарт при монтировании (фикс)
    useEffect(() => {
        if (options.autoStart) start();
    }, [options.autoStart]); // 👈 теперь действительно запускается

    return { timeLeft, isActive, start, stop, reset };
}

///Пересмотреть возможно логика легче
