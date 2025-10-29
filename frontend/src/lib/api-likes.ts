import { supabase } from "@/lib/supabaseClient";
import type { LikeResponse } from "@/types/db";

export async function toggleLike(postId: number): Promise<LikeResponse> {
    const session = (await supabase.auth.getSession()).data.session;
    if (!session) throw new Error("Not authenticated");

    const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/toggle-like`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ post_id: postId }),
        },
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Toggle like failed");
    return data;
}
