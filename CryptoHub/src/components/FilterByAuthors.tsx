import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { supabase } from "@/lib/supabaseClient";
import { useFilters } from "@/store/useFilters";
import { useQuery } from "@tanstack/react-query";
import type { Author } from "@/types/token&authorType";

export default function Authors() {
  const { setSelectedAuthorId } = useFilters();

  const {
    data: authors,
    isLoading,
    error,
  } = useQuery<Author[]>({
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
  if (isLoading) return <p className="text-gray-400">Загрузка...</p>;
  if (error) return <p className="text-red-500">Ошибка: {error.message}</p>;

  const safeAuthors = authors ?? [];

  return (
    <div className="flex items-center justify-center bg-black">
      <Autocomplete
        disablePortal
        options={safeAuthors}
        getOptionLabel={(a) => a.label || ""}
        onChange={(_, value) => setSelectedAuthorId(value?.id ?? null)}
        renderOption={(props, option, { index }) => (
          <>
            <li
              {...props}
              className="flex items-center justify-between gap-2 px-3 py-2 bg-[#121212] hover:bg-[#1e1e1e] text-gray-200 cursor-pointer transition-colors duration-150"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{option.label}</span>
              </div>
            </li>

            {/* Разделитель между элементами */}
            {index < safeAuthors.length - 1 && (
              <hr className="border-t border-gray-700  opacity-40" />
            )}
          </>
        )}
        sx={{
          width: 300,
          "& .MuiInputBase-root": {
            backgroundColor: "#111",
            color: "#fff",
            borderRadius: "8px",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#444",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#777",
          },
          "& .MuiSvgIcon-root": {
            color: "#fff",
          },
          "& .MuiInputLabel-root": {
            color: "#aaa",
          },
          "& .MuiAutocomplete-listbox": {
            backgroundColor: "#121212",
            paddingTop: 0,
            paddingBottom: 0,
          },
        }}
        renderInput={(params) => (
          <TextField {...params} label="Выбери автора" />
        )}
      />
    </div>
  );
}
