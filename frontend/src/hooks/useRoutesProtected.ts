import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useUserProfile } from "@/api/user/useUserProfile";
import { useSession } from "../api/user/useSession";

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
    const session = useSession();
    const user = session?.user ?? null;
    const userId = user?.id;
    const { data: profile } = useUserProfile(userId);

    useEffect(() => {
        if (requireAuth && !user) {
            navigate({ to: redirectTo ?? "/auth/email" });
            return;
        }

        if (requireNoAuth && user) {
            navigate({ to: redirectTo ?? "/profile/main" });
            return;
        }

        if (requireVerifiedEmail && !user?.email_confirmed_at) {
            navigate({ to: "/auth/email" });
            return;
        }

        if (requireNickname && !profile?.nickname) {
            navigate({ to: "/auth/savenickname" });
        }

        if (requireEmailSent) {
            navigate({ to: "/auth/email" });
            return;
        }
    }, [
        user,
        profile?.nickname,
        requireAuth,
        requireNoAuth,
        requireVerifiedEmail,
        requireNickname,
        navigate,
    ]);
}
