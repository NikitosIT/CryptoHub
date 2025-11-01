import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";

interface GuardOptions {
    requireAuth?: boolean; // нужно ли быть залогиненным
    requireNoAuth?: boolean; // наоборот — для страниц входа
    requireVerifiedEmail?: boolean; // если нужно, чтобы email был подтверждён
    requireNickname?: boolean; // если нужен установленный ник
    requireEmailSent?: boolean; //требуется отправка email
    redirectTo?: string; // кастомный редирект
}

export function useRoutesProtected({
    requireAuth = false,
    requireNoAuth = false,
    requireVerifiedEmail = false,
    requireNickname = false,
    requireEmailSent = false,
    redirectTo,
}: GuardOptions) {
    const navigate = useNavigate();
    const { user, nickname, isEmailSent } = useUserStore();

    useEffect(() => {
        // 🔐 если нужно быть залогиненным, но юзера нет — редиректим
        if (requireAuth && !user) {
            navigate({ to: redirectTo ?? "/auth/email" });
            return;
        }

        // 🚫 если юзер залогинен, но страница для незалогиненных (login, verify и т.п.)
        if (requireNoAuth && user) {
            navigate({ to: redirectTo ?? "/profile/profile" });
            return;
        }

        // 📨 если нужно подтверждение email, а email не найден
        if (requireVerifiedEmail && !user?.email_confirmed_at) {
            navigate({ to: "/auth/email" });
            return;
        }

        // 🧩 если нужен никнейм, а его ещё нет
        if (requireNickname && !nickname) {
            navigate({ to: "/auth/savenickname" });
        }
        if (requireEmailSent && !isEmailSent) {
            navigate({ to: "/auth/email" }); // 🔥 без отправки кода — редирект
            return;
        }
    }, [
        user,
        nickname,
        requireAuth,
        requireNoAuth,
        requireVerifiedEmail,
        requireNickname,
        navigate,
    ]);
}

//useRoutesProtected or useRoutesSecurity
