import FilterAuthors from "@/components/filters/FilterByAuthors";

import FilterTokens from "@/components/filters/FilterByToken";

import PostsList from "@/components/PostsList";
import { useFavoritesFiltersStore } from "@/store/useFiltersStore";
import { useSession } from "@supabase/auth-helpers-react";

export default function ProfileFavoritesPosts() {
  const session = useSession();
  const { selectedAuthorId, selectedToken } = useFavoritesFiltersStore();

  return (
    <div className="space-y-6">
      {/* Фильтры */}
      <div className="flex flex-col items-center justify-center w-full gap-6 px-4 pt-4 pb-6 bg-black md:flex-row md:items-center md:gap-10 md:px-10">
        <FilterAuthors useStore={useFavoritesFiltersStore} />
        <FilterTokens useStore={useFavoritesFiltersStore} />
      </div>

      <PostsList
        mode="favorites"
        userId={session?.user.id ?? null}
        authorId={selectedAuthorId}
        tokenName={selectedToken?.value ?? null}
      />
    </div>
  );
}
