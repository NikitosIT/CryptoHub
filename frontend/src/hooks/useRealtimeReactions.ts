// import { useEffect } from "react";

// import { useQueryClient } from "@tanstack/react-query";
// import { supabase } from "@/lib/supabaseClient";

// export function useRealtimeReactions() {
//     const queryClient = useQueryClient();

//     useEffect(() => {
//         const channel = supabase
//             .channel("posts-realtime")
//             .on(
//                 "postgres_changes",
//                 { event: "UPDATE", schema: "public", table: "telegram_posts" },
//                 (payload) => {
//                     const updatedPost = payload.new;

//                     // 🔹 Обновляем кэш всех постов в React Query
//                     queryClient.setQueryData(["posts"], (oldData: any) => {
//                         if (!oldData) return oldData;

//                         return {
//                             ...oldData,
//                             pages: oldData.pages.map((page: any) =>
//                                 page.map((post: any) =>
//                                     post.id === updatedPost.id
//                                         ? {
//                                             ...post,
//                                             like_count: updatedPost.like_count,
//                                             dislike_count:
//                                                 updatedPost.dislike_count,
//                                         }
//                                         : post
//                                 )
//                             ),
//                         };
//                     });
//                 },
//             )
//             .subscribe();

//         return () => {
//             supabase.removeChannel(channel);
//         };
//     }, [queryClient]);
// }
