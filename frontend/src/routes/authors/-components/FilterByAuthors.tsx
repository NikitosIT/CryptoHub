import { memo, useCallback, useEffect, useMemo } from 'react';

import { useToast } from '@/hooks/useToast';
import { useListAuthors } from '@/routes/authors/-api/useListAuthors';
import { useSelectedAuthorId } from '@/store/useFiltersStore';
import type { Author } from '@/types/db';

import SelectFilter from '../../../components/filters/CustomSelectFilter';
import FilterSkeleton from '../../../components/filters/FilterSkeleton';

function FilterAuthors() {
  const { selectedAuthorId, setSelectedAuthorId } = useSelectedAuthorId();
  const { data: authors, isLoading, error } = useListAuthors();
  const { showError } = useToast();

  useEffect(() => {
    if (error) {
      showError(error instanceof Error ? error.message : 'Failed to load authors list');
    }
  }, [error, showError]);

  const safeAuthors = useMemo(() => authors ?? [], [authors]);

  const selectedAuthor = useMemo(
    () => safeAuthors.find((a) => a.id === selectedAuthorId) ?? null,
    [safeAuthors, selectedAuthorId],
  );

  const handleChange = useCallback(
    (val: Author | null) => {
      setSelectedAuthorId(val?.id ?? null);
    },
    [setSelectedAuthorId],
  );

  if (isLoading) return <FilterSkeleton />;

  return (
    <div className="w-full">
      <SelectFilter<Author>
        label="Select author"
        options={safeAuthors}
        value={selectedAuthor}
        onChange={handleChange}
      />
    </div>
  );
}

export default memo(FilterAuthors);
