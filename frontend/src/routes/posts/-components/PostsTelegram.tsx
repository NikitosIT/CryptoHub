import { useFiltersForMode } from "@/store/useFiltersStore";

import FilterAuthors from "../../authors/-components/FilterByAuthors";
import FilterTokens from "../../tokens/-components/FilterByToken";
import { TokenDetails } from "../../tokens/-components/TokenDetails";
import PostsList from "./PostsList";

export function PostsTelegram() {
  const { selectedToken } = useFiltersForMode();

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col items-center w-full gap-5 px-2 pt-6 pb-6 sm:gap-4 sm:px-4 sm:pt-8 sm:pb-8 md:flex-row md:items-center md:justify-center md:gap-6 md:px-10">
        <div className="w-full max-w-[280px] sm:w-auto sm:min-w-[220px]">
          <FilterAuthors />
        </div>
        <div className="w-full max-w-[280px] sm:w-auto sm:min-w-[220px]">
          <FilterTokens />
        </div>
      </div>

      {/* Token Details */}
      {selectedToken ? (
        <div className="w-full px-2 sm:px-4 md:px-10">
          <TokenDetails />
        </div>
      ) : null}

      <PostsList />
    </>
  );
}
