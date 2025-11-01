import FilterAuthors from "@/components/filters/FilterByAuthors";
import FilterTokens from "@/components/filters/FilterByToken";
import PostsList from "@/components/PostsList";
import { useUnlikedFiltersStore } from "@/store/useFiltersStore";
import { useSession } from "@supabase/auth-helpers-react";

function ProfileUnlikedPosts() {
  const session = useSession();
  const { selectedAuthorId, selectedToken } = useUnlikedFiltersStore();

  return (
    <div className="space-y-6">
      {/* Фильтры */}
      <div className="flex flex-col items-center justify-center w-full gap-6 px-4 pt-4 pb-6 bg-black md:flex-row md:items-center md:gap-10 md:px-10">
        <FilterAuthors />
        <FilterTokens />
      </div>

      <PostsList
        mode="disliked"
        userId={session?.user.id ?? null}
        authorId={selectedAuthorId}
        tokenName={selectedToken?.value ?? null}
      />
    </div>
  );
}

export default ProfileUnlikedPosts;
