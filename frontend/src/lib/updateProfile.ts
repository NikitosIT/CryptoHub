import { supabase } from "@/lib/supabaseClient";

export interface UpdateProfilePayload {
    user_id: string;
    nickname?: string;
    profile_logo?: string;
}

export interface UpdateProfileResponse {
    nickname?: string | null;
    profile_logo?: string | null;
}

export async function updateProfileRequest(
    payload: UpdateProfilePayload,
): Promise<UpdateProfileResponse> {
    const {
        data: { session },
    } = await supabase.auth.getSession();

    const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/update-nickname`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify(payload),
        },
    );

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || "Ошибка при обновлении профиля");
    }

    return data as UpdateProfileResponse;
}
