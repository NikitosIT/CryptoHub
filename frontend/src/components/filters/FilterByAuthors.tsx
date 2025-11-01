import { useFiltersStore } from "@/store/useFiltersStore";
import SelectFilter from "./CustomSelectFilter";
import type { Author } from "@/types/TokenAndAuthorTypes";
import FilterSkeleton from "./FilterSkeleton";
import { useFilterAuthors } from "@/api/useFilterAuthors";

export default function FilterAuthors() {
  const { selectedAuthorId, setSelectedAuthorId } = useFiltersStore();

  const { data: authors, isLoading, error } = useFilterAuthors();
  if (isLoading) return <FilterSkeleton />;
  if (error) return <p className="text-red-500">Ошибка: {error.message}</p>;

  const safeAuthors = authors ?? [];
  const selectedAuthor =
    safeAuthors.find((a) => a.id === selectedAuthorId) ?? null;
  return (
    <div className="flex items-center justify-center bg-black">
      <SelectFilter<Author>
        label="Выбери автора"
        options={safeAuthors}
        value={selectedAuthor}
        onChange={(val) => setSelectedAuthorId(val?.id ?? null)}
        loading={isLoading}
        showLogos={false}
      />
    </div>
  );
}

//FilterAuthros
