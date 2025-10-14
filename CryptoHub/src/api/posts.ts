// import { createClient } from "@supabase/supabase-js";

// const supabase = createClient(
//     import.meta.env.VITE_SUPABASE_URL!,
//     import.meta.env.VITE_SUPABASE_ANON_KEY!,
// );

// export async function getTelegramPosts() {
//     const { data, error } = await supabase
//         .from("telegram_posts")
//         .select("id, text_caption, text_entities, media, created_at").order(
//             "id",
//             { ascending: false },
//         );

//     if (error) throw error;
//     return data ?? [];
// }
