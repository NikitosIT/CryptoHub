import { useEffect } from 'react';
import { Button, Typography } from '@mui/material';

import { useToast } from '@/hooks/useToast';
import { useListTokens } from '@/routes/tokens/-api/useListTokens';
import { useFiltersForMode } from '@/store/useFiltersStore';
import type { Token } from '@/types/db';

import SelectFilter from '../../../components/filters/CustomSelectFilter';
import FilterSkeleton from '../../../components/filters/FilterSkeleton';

export default function FilterTokens() {
  const { selectedToken, setSelectedToken } = useFiltersForMode();
  console.log('selectedToken', selectedToken);
  const { data: tokens, isLoading, error } = useListTokens();
  const { showError } = useToast();

  useEffect(() => {
    if (error) {
      showError(
        error instanceof Error ? error.message : 'Failed to load tokens list',
      );
    }
  }, [error, showError]);

  if (isLoading) return <FilterSkeleton />;

  const safeTokens = tokens ?? [];

  return (
    <div className="w-full">
      <Typography>{selectedToken?.label}</Typography>
      <Button
        onClick={() => {
          setSelectedToken(null);
        }}
      >
        reset
      </Button>
      <SelectFilter<Token>
        label="Select token"
        options={safeTokens}
        value={selectedToken}
        onChange={(val) => setSelectedToken(val)}
        showLogos
      />
      {/* <SelectFilter<Token>
        label="asdasdad"
        options={safeTokens}
        value={a}
        onChange={(val) => setA(val)}
        showLogos
      /> */}
    </div>
  );
}
