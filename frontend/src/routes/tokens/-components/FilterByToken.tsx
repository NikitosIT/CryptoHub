import { memo, useCallback, useEffect, useMemo } from 'react';

import { useToast } from '@/hooks/useToast';
import { useListCryptoTokens } from '@/routes/tokens/-api/useListCryptoTokens';
import { type SelectedToken, useSelectedToken } from '@/store/useFiltersStore';

import SelectFilter from '../../../components/filters/CustomSelectFilter';
import FilterSkeleton from '../../../components/filters/FilterSkeleton';

function FilterTokens() {
  const { selectedToken, setSelectedToken } = useSelectedToken();

  const { data: rawTokens, isLoading, error } = useListCryptoTokens();
  const { showError } = useToast();

  useEffect(() => {
    if (error) {
      showError(error instanceof Error ? error.message : 'Failed to load tokens list');
    }
  }, [error, showError]);

  const tokens = useMemo<SelectedToken[]>(() => {
    return (rawTokens ?? []).map((t) => ({
      label: t.name,
      value: t.symbol,
      imageUrl: t.image,
    }));
  }, [rawTokens]);

  const handleChange = useCallback(
    (val: SelectedToken | null) => {
      setSelectedToken(val);
    },
    [setSelectedToken],
  );

  if (isLoading) return <FilterSkeleton />;

  return (
    <div className="w-full">
      <SelectFilter
        label="Select token"
        options={tokens}
        value={selectedToken}
        onChange={handleChange}
      />
    </div>
  );
}

export default memo(FilterTokens);
