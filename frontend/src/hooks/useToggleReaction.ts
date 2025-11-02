import { toggleReactions } from "@/api/toggleReactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useToggleReaction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ postId, reactionType, userId }: {
            postId: number;
            reactionType: "like" | "dislike";
            userId: string;
        }) => {
            return await toggleReactions(postId, reactionType, userId);
        },

        onMutate: async ({ postId, reactionType }) => {
            await queryClient.cancelQueries({ queryKey: ["posts"] });
            const previous = queryClient.getQueriesData({
                queryKey: ["posts"],
            });

            queryClient.setQueriesData({ queryKey: ["posts"] }, (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    pages: old.pages.map((page: any) =>
                        page.map((p: any) => {
                            if (p.id !== postId) return p;

                            const prevReaction = p.user_reaction;
                            let likeCount = p.like_count;
                            let dislikeCount = p.dislike_count;

                            if (reactionType === "like") {
                                if (prevReaction === "like") likeCount -= 1;
                                else {
                                    likeCount += 1;
                                    if (
                                        prevReaction === "dislike"
                                    ) dislikeCount -= 1;
                                }
                                p.user_reaction = prevReaction === "like"
                                    ? null
                                    : "like";
                            } else {
                                if (prevReaction === "dislike") {
                                    dislikeCount -= 1;
                                } else {
                                    dislikeCount += 1;
                                    if (prevReaction === "like") likeCount -= 1;
                                }
                                p.user_reaction = prevReaction === "dislike"
                                    ? null
                                    : "dislike";
                            }

                            return {
                                ...p,
                                like_count: likeCount,
                                dislike_count: dislikeCount,
                            };
                        })
                    ),
                };
            });

            return { previous };
        },

        onError: (_err, _vars, context) => {
            if (context?.previous) {
                queryClient.setQueriesData(
                    { queryKey: ["posts"] },
                    context.previous,
                );
            }
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
    });
}
