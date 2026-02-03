import { useScrollTop } from "@/hooks/useScrollTop";
import { useListAuthors } from "@/routes/authors/-api/useListAuthors";
import {
  PAGE_SIZE,
  useTelegramPosts,
} from "@/routes/posts/-api/useListTelegramPosts";
import { useFiltersForMode } from "@/store/useFiltersStore";

import FeedSkeleton from "./FeedSkeleton";
import { PostCard } from "./PostCard";

export default function PostsList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useTelegramPosts();

  const { data: authors } = useListAuthors();
  const { selectedAuthorId: authorId } = useFiltersForMode();
  const { show: showScrollTop, scrollToTop } = useScrollTop();

  const pages = data?.pages ?? [];
  const posts = pages.flat();
  const lastPage = pages[pages.length - 1] ?? [];

  const shouldShowLoadMore = hasNextPage && lastPage.length === PAGE_SIZE;

  if (isLoading) return <FeedSkeleton />;

  const selectedAuthorName =
    authorId != null
      ? (authors?.find((author) => author.id === authorId)?.label ?? null)
      : null;

  if (authorId != null && posts.length === 0) {
    return (
      <p className="px-4 py-3 mt-4 text-sm text-center text-gray-400 shadow-inner sm:px-6 sm:mt-6 sm:text-base rounded-xl shadow-black/30">
        No posts from{" "}
        <span className="font-semibold text-white">
          {selectedAuthorName ?? "this author"}
        </span>
      </p>
    );
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {/* Load more button */}
      {shouldShowLoadMore ? (
        <button
          onClick={() => void fetchNextPage()}
          disabled={isFetchingNextPage}
          className="w-full py-3 mt-4 text-sm text-gray-400 border rounded-lg hover:text-white disabled:opacity-50"
        >
          {isFetchingNextPage ? "Loading..." : "Load more"}
        </button>
      ) : null}

      {showScrollTop ? (
        <button
          onClick={scrollToTop}
          className="fixed z-50 transition-transform duration-300 -translate-y-1/2 cursor-pointer right-2 sm:right-4 top-1/2 hover:scale-105"
          aria-label="Scroll to top"
        >
          <img
            src="/others/rocket-img2.png"
            alt="Scroll to top"
            className="object-contain w-12 h-18 sm:w-14 sm:h-20 md:w-16 md:h-24"
          />
        </button>
      ) : null}
    </div>
  );
}
