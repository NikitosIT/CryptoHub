export async function toggleReactions(
    postId: number,
    reactionType: "like" | "dislike",
    userId: string,
) {
    const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/toggle-like`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                post_id: postId,
                reaction_type: reactionType,
                user_id: userId,
            }),
        },
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Toggle reaction failed");
    return data;
}
