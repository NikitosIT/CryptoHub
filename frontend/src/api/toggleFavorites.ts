export async function toggleFavorite(postId: number, userId: string) {
    const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/toggle-favorites`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ post_id: postId, user_id: userId }),
        },
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Favorites reaction failed");
    return data as {
        success: boolean;
        status: "added" | "removed";
        is_favorite: boolean;
    };
}
