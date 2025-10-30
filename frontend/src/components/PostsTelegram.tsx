import Tokens from "./filters/FilterByToken";
import Authors from "./filters/FilterByAuthors";
import { useUserLikes } from "@/api/useUserLikes";
import PostList from "./PostSettings";
import { useAuthorsStore } from "@/store/useAuthorsStore";

export function PostFeed() {
  useUserLikes();
  const { selectedAuthorId, selectedToken } = useAuthorsStore();

  return (
    <div className="space-y-6">
      {/* Фильтры */}
      <div className="flex flex-col items-center justify-center w-full gap-6 px-4 pt-4 pb-6 bg-black md:flex-row md:items-center md:gap-10 md:px-10">
        <Authors />
        <Tokens />
      </div>

      <PostList
        mode="all"
        userId={null}
        authorId={selectedAuthorId}
        tokenName={selectedToken?.value ?? null}
      />
    </div>
  );
}
