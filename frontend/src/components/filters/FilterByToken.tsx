import SelectFilter from "./CustomSelectFilter";
import type { Token } from "@/types/TokenAndAuthorTypes";
import FilterSkeleton from "./FilterSkeleton";
import { TokenDetails } from "./TokenDetails";
import { useFilterTokens } from "@/api/useFilterTokens";
import { useFiltersStore } from "@/store/useFiltersStore";

export default function FilterTokens() {
  const { selectedToken, setSelectedToken } = useFiltersStore();
  const { data: tokens, isLoading, error } = useFilterTokens();

  if (isLoading) return <FilterSkeleton />;
  if (error) return <p className="text-red-500">Ошибка: {error.message}</p>;

  const safeTokens = tokens ?? [];

  return (
    <div className="flex flex-col items-center justify-start pb-4 bg-black">
      <div className="flex items-center justify-center bg-black">
        <SelectFilter<Token>
          label="Выбери токен"
          options={safeTokens}
          value={selectedToken}
          onChange={(val) => setSelectedToken(val ?? null)}
          loading={isLoading}
          showLogos
        />
      </div>

      {selectedToken && <TokenDetails selectedToken={selectedToken} />}
    </div>
  );
}

//FilterToken
