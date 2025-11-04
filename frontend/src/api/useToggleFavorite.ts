import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleFavorite } from "./toggleFavorites";
import type { InfiniteData } from "@tanstack/react-query";
import type { TelegramPost } from "@/types/db";

export function useToggleFavorite() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            postId,
            userId,
        }: {
            postId: number;
            userId: string;
        }) => {
            return await toggleFavorite(postId, userId);
        },

        onMutate: async ({ postId, userId }) => {
            await queryClient.cancelQueries({ queryKey: ["posts"] });

            const previous = queryClient.getQueriesData<
                InfiniteData<TelegramPost[]>
            >({
                queryKey: ["posts"],
            });

            // Determine previous favorite state and snapshot the post
            let wasFavorite = false;
            let snapshotPost: TelegramPost | null = null;
            for (const [, data] of previous) {
                if (!data) continue;
                for (const page of data.pages) {
                    const found = page.find((p) => p.id === postId);
                    if (found) {
                        wasFavorite = !!found.is_favorite;
                        snapshotPost = {
                            ...found,
                            is_favorite: !found.is_favorite,
                        };
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
                        page.map((p) =>
                            p.id === postId
                                ? { ...p, is_favorite: !p.is_favorite }
                                : p
                        )
                    ),
                };
            });

            // Optimistically reorder the favorites feed for this user
            if (snapshotPost) {
                const favoritesQueries = queryClient.getQueriesData<
                    InfiniteData<TelegramPost[]>
                >({
                    queryKey: [
                        "posts",
                        undefined,
                        undefined,
                        "favorites",
                        userId,
                    ],
                });

                for (const [key] of favoritesQueries) {
                    queryClient.setQueryData<InfiniteData<TelegramPost[]>>(
                        key,
                        (old) => {
                            if (!old) return old;
                            // Flatten, remove duplicates of the post, and optionally add to top
                            const pages = old.pages.map((page) =>
                                page.filter((p) => p.id !== postId)
                            );
                            if (!wasFavorite) {
                                // Add to top of first page
                                if (pages.length === 0) {
                                    pages.push([snapshotPost!]);
                                } else {
                                    pages[0] = [snapshotPost!, ...pages[0]];
                                }
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
                for (const [key, data] of context.previous) {
                    queryClient.setQueryData(key, data);
                }
            }
        },
    });
}
