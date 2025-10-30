import { useUserLikes } from "@/api/useUserLikes";
import Authors from "@/components/filters/FilterByAuthors";
import Tokens from "@/components/filters/FilterByToken";
import PostList from "@/components/PostSettings";
import { useLikedFiltersStore } from "@/store/useAuthorsStore";
import { useSession } from "@supabase/auth-helpers-react";

export default function ProfileLikedPosts() {
  useUserLikes();
  const session = useSession();

  const { selectedAuthorId, selectedToken } = useLikedFiltersStore();

  return (
    <div className="space-y-6">
      {/* Фильтры */}
      <div className="flex flex-col items-center justify-center w-full gap-6 px-4 pt-4 pb-6 bg-black md:flex-row md:items-center md:gap-10 md:px-10">
        <Authors />
        <Tokens />
      </div>

      <PostList
        mode="liked"
        userId={session?.user.id ?? null}
        authorId={selectedAuthorId}
        tokenName={selectedToken?.value ?? null}
      />
    </div>
  );
}
