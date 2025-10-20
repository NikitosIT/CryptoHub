import { useInfinitePosts } from "@/utils/TestLazyLoad";
import { FeedSkeleton } from "@/components/FeedSkeleton";
import { TelegramCaption } from "./PostBody";
import { useFilters } from "@/store/useFilters";
import Tokens from "./FilterByToken";
import { useTokens } from "@/store/useTokens";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useScrollTop } from "@/hooks/useScrollTop";
import Authors from "./FilterByAuthors";

export function PostFeed() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfinitePosts();
  const observerRef = useInfiniteScroll({ hasNextPage, fetchNextPage });
  const { show: showScrollTop, scrollToTop } = useScrollTop();

  const { selectedAuthorId } = useFilters();
  const { selectedToken } = useTokens();
  const posts = data?.pages.flat() ?? [];

  const filteredPosts = posts.filter((p) => {
    const matchAuthor =
      !selectedAuthorId || p.tg_author_id === selectedAuthorId;

    const matchToken =
      !selectedToken || p.crypto_tokens?.includes(selectedToken.value);

    return matchAuthor && matchToken;
  });

  if (isLoading) return <FeedSkeleton />;

  return (
    <div className="space-y-4">
      <Authors />
      <Tokens />

      {filteredPosts.map((post, idx) => (
        <div key={post.id}>
          {/* Имя автора над постом */}
          <div className="mb-2 ml-1 ">
            <a
              href={post.author_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-semibold text-white transition-colors duration-200 ml-95 hover:text-blue-400"
            >
              {post.author_name}
            </a>
          </div>

          {/* Сам пост */}
          <div className="p-4 border shadow-sm rounded-xl">
            <TelegramCaption post={post} />
          </div>

          {/* Разделительная линия между постами */}
          {idx < filteredPosts.length - 1 && (
            <hr className="w-full mx-auto my-8 border-gray-800" />
          )}
        </div>
      ))}

      <div ref={observerRef} />
      {isFetchingNextPage && (
        <p className="text-center text-gray-500">Загрузка...</p>
      )}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed z-50 p-3 text-white transition-all duration-300 rounded-full shadow-lg bottom-50 right-6 // bg-sky-500 hover:bg-sky-600 shadow-sky-500/30 hover:scale-105"
          aria-label="Наверх"
        >
          ↑
        </button>
      )}
    </div>
  );
}
