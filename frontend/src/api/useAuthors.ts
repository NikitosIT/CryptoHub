import { supabase } from "@/lib/supabaseClient";
import type { Author } from "@/types/TokenAndAuthorTypes";
import { useQuery } from "@tanstack/react-query";

export const useAuthors = () => {
    return useQuery<Author[]>({
        queryKey: ["authors"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("authors")
                .select("author_name, tg_author_id");
            if (error) throw error;
            return data.map((author) => ({
                label: author.author_name,
                id: author.tg_author_id,
            }));
        },
    });
};
