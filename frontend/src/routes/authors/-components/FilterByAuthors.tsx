import { useEffect } from "react";

import { useToast } from "@/hooks/useToast";
import { useListAuthors } from "@/routes/authors/-api/useListAuthors";
import { useFiltersForMode } from "@/store/useFiltersStore";
import type { Author } from "@/types/db";

import SelectFilter from "../../../components/filters/CustomSelectFilter";
import FilterSkeleton from "../../../components/filters/FilterSkeleton";

export default function FilterAuthors() {
  const { selectedAuthorId, setSelectedAuthorId } = useFiltersForMode();
  const { data: authors, isLoading, error } = useListAuthors();
  const { showError } = useToast();

  useEffect(() => {
    if (error) {
      showError(
        error instanceof Error ? error.message : "Failed to load authors list"
      );
    }
  }, [error, showError]);

  if (isLoading) return <FilterSkeleton />;

  const safeAuthors = authors ?? [];
  const selectedAuthor =
    safeAuthors.find((a) => a.id === selectedAuthorId) ?? null;

  return (
    <div className="w-full">
      <SelectFilter<Author>
        label="Select author"
        options={safeAuthors}
        value={selectedAuthor}
        onChange={(val) => setSelectedAuthorId(val?.id ?? null)}
        showLogos={false}
      />
    </div>
  );
}
