import { memo, useCallback, useEffect, useMemo } from 'react';

import { useToast } from '@/hooks/useToast';
import { useListTokens } from '@/routes/tokens/-api/useListTokens';
import { useSelectedToken } from '@/store/useFiltersStore';
import type { Token } from '@/types/db';

import SelectFilter from '../../../components/filters/CustomSelectFilter';
import FilterSkeleton from '../../../components/filters/FilterSkeleton';

function FilterTokens() {
  const { selectedToken, setSelectedToken } = useSelectedToken();

  const { data: tokens, isLoading, error } = useListTokens();
  const { showError } = useToast();

  useEffect(() => {
    if (error) {
      showError(error instanceof Error ? error.message : 'Failed to load tokens list');
    }
  }, [error, showError]);

  const safeTokens = useMemo(() => tokens ?? [], [tokens]);

  const handleChange = useCallback(
    (val: Token | null) => {
      setSelectedToken(val);
    },
    [setSelectedToken],
  );

  if (isLoading) return <FilterSkeleton />;

  return (
    <div className="w-full">
      <SelectFilter<Token>
        label="Select token"
        options={safeTokens}
        value={selectedToken}
        onChange={handleChange}
        showLogos
      />
    </div>
  );
}

export default memo(FilterTokens);
