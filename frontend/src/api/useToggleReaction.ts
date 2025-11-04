import { toggleReactions } from "@/api/toggleReactions";
import type { TelegramPost } from "@/types/db";
import {
    type InfiniteData,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

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

        onMutate: async ({ postId, reactionType, userId }) => {
            await queryClient.cancelQueries({ queryKey: ["posts"] });
            const previous = queryClient.getQueriesData<
                InfiniteData<TelegramPost[]>
            >({
                queryKey: ["posts"],
            });

            let prevReaction: "like" | "dislike" | null = null;
            let snapshotPost: TelegramPost | null = null;
            for (const [, data] of previous) {
                if (!data) continue;
                for (const page of data.pages) {
                    const found = page.find((post) => post.id === postId);
                    if (found) {
                        prevReaction = found.user_reaction;
                        snapshotPost = { ...found };
                        break;
                    }
                }
                if (snapshotPost) break;
            }

            queryClient.setQueriesData<InfiniteData<TelegramPost[]>>({
                queryKey: ["posts"],
            }, (old) => {
                if (!old) return old;
                return {
                    ...old,
                    pages: old.pages.map((page) =>
                        page.map((p) => {
                            if (p.id !== postId) return p;

                            const prev = p.user_reaction;
                            let likeCount = p.like_count ?? 0;
                            let dislikeCount = p.dislike_count ?? 0;

                            if (reactionType === "like") {
                                if (prev === "like") likeCount -= 1;
                                else {
                                    likeCount += 1;
                                    if (prev === "dislike") dislikeCount -= 1;
                                }
                                p.user_reaction = prev === "like"
                                    ? null
                                    : "like";
                            } else {
                                if (prev === "dislike") {
                                    dislikeCount -= 1;
                                } else {
                                    dislikeCount += 1;
                                    if (prev === "like") likeCount -= 1;
                                }
                                p.user_reaction = prev === "dislike"
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

            let nextReaction: "like" | "dislike" | null = null;
            if (reactionType === "like") {
                nextReaction = prevReaction === "like" ? null : "like";
            } else {
                nextReaction = prevReaction === "dislike" ? null : "dislike";
            }

            if (snapshotPost) {
                snapshotPost = { ...snapshotPost, user_reaction: nextReaction };
                const nonNullSnapshot: TelegramPost = snapshotPost;

                const removeFromPages = (
                    pages: TelegramPost[][],
                ): TelegramPost[][] =>
                    pages.map((page) => page.filter((p) => p.id !== postId));

                const likedQueries = queryClient.getQueriesData<
                    InfiniteData<TelegramPost[]>
                >({
                    queryKey: ["posts", undefined, undefined, "liked", userId],
                });
                for (const [key] of likedQueries) {
                    queryClient.setQueryData<InfiniteData<TelegramPost[]>>(
                        key,
                        (old) => {
                            if (!old) return old;
                            let pages = removeFromPages(old.pages);
                            if (nextReaction === "like") {
                                if (pages.length === 0) {
                                    pages = [[nonNullSnapshot]];
                                } else {pages[0] = [
                                        nonNullSnapshot,
                                        ...pages[0],
                                    ];}
                            }
                            return { ...old, pages };
                        },
                    );
                }

                const dislikedQueries = queryClient.getQueriesData<
                    InfiniteData<TelegramPost[]>
                >({
                    queryKey: [
                        "posts",
                        undefined,
                        undefined,
                        "disliked",
                        userId,
                    ],
                });
                for (const [key] of dislikedQueries) {
                    queryClient.setQueryData<InfiniteData<TelegramPost[]>>(
                        key,
                        (old) => {
                            if (!old) return old;
                            let pages = removeFromPages(old.pages);
                            if (nextReaction === "dislike") {
                                if (pages.length === 0) {
                                    pages = [[nonNullSnapshot]];
                                } else {pages[0] = [
                                        nonNullSnapshot,
                                        ...pages[0],
                                    ];}
                            }
                            return { ...old, pages };
                        },
                    );
                }
            }

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
