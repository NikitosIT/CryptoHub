import { toggleFavorite } from "@/api/ToggleFavorites";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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

        onMutate: async ({ postId }) => {
            await queryClient.cancelQueries({ queryKey: ["posts"] });

            const previous = queryClient.getQueriesData({
                queryKey: ["posts"],
            });

            queryClient.setQueriesData({ queryKey: ["posts"] }, (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    pages: old.pages.map((page: any[]) =>
                        page.map((p) =>
                            p.id === postId
                                ? { ...p, is_favorite: !p.is_favorite }
                                : p
                        )
                    ),
                };
            });

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
