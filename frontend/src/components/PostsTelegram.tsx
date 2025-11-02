import PostsList from "./PostsList";

import { useUserStore } from "@/store/useUserStore";
import FilterAuthors from "./filters/FilterByAuthors";
import FilterTokens from "./filters/FilterByToken";
import { useFiltersStore } from "@/store/useFiltersStore";

export function PostFeed() {
  const { selectedAuthorId, selectedToken } = useFiltersStore();
  const { user } = useUserStore();

  return (
    <div className="space-y-6">
      {/* Фильтры */}
      <div className="flex flex-col items-center justify-center w-full gap-6 px-4 pt-4 pb-6 bg-black md:flex-row md:items-center md:gap-10 md:px-10">
        <FilterAuthors useStore={useFiltersStore} />
        <FilterTokens useStore={useFiltersStore} />
      </div>

      <PostsList
        mode="all"
        userId={user?.id}
        authorId={selectedAuthorId}
        tokenName={selectedToken?.value ?? null}
      />
    </div>
  );
}
