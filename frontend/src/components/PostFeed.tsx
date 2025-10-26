import { useInfinitePosts } from "@/api/useInfinitePosts";
import { TelegramCaption } from "./PostBody";
import { useAuthorsStore } from "@/store/useAuthorsStore";
import Tokens from "./filters/FilterByToken";
import { useTokensStore } from "@/store/useTokensStore";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useScrollTop } from "@/hooks/useScrollTop";
import Authors from "./filters/FilterByAuthors";
import FeedSkeleton from "./FeedSkeleton";

export function PostFeed() {
  const selectedAuthorId = useAuthorsStore((s) => s.selectedAuthorId);
  const selectedToken = useTokensStore((s) => s.selectedToken);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfinitePosts(selectedAuthorId, selectedToken?.value);
  const observerRef = useInfiniteScroll({ hasNextPage, fetchNextPage });
  const { show: showScrollTop, scrollToTop } = useScrollTop();

  const posts = data?.pages.flat() ?? [];

  if (isLoading) return <FeedSkeleton />;
  return (
    <div className="space-y-6">
      {/* Фильтры */}
      <div className="flex flex-col items-center justify-center w-full gap-6 px-4 pt-4 pb-6 bg-black md:flex-row md:items-center md:gap-10 md:px-10">
        <Authors />
        <Tokens />
      </div>

      {/* Список постов */}
      <div className="max-w-2xl mx-auto space-y-8">
        {posts.map((post, idx) => {
          const authorLogo = `/authors/${post.tg_author_id}.jpg`;
          const hasLogo = !!post.tg_author_id;

          return (
            <article key={post.id} className="pb-8 border-b border-gray-800">
              {/* Автор */}
              <header className="flex items-center gap-3 mb-3">
                {hasLogo && (
                  <img
                    src={authorLogo}
                    alt={post.author_name}
                    className="object-cover border border-gray-700 rounded-full w-9 h-9"
                    onError={(e) =>
                      (e.currentTarget.src = `/authors/${post.tg_author_id}.png`)
                    }
                  />
                )}

                <a
                  href={post.author_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base font-semibold text-white transition-colors duration-200 hover:text-blue-400"
                >
                  {post.author_name}
                </a>
              </header>

              {/* Контент поста */}
              <div className="p-4 border shadow-sm rounded-xl">
                <TelegramCaption post={post} />
              </div>

              {/* Разделитель между постами */}
              {/* {idx < posts.length - 1 && (
                <hr className="w-full mx-auto my-8 border-gray-800" />
              )} */}
            </article>
          );
        })}

        {/* Триггер для Infinite Scroll */}
        <div ref={observerRef} className="h-1" />

        {/* Скелетон при подгрузке */}
        {isFetchingNextPage && <FeedSkeleton />}
      </div>

      {/* Кнопка "Наверх" */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed z-50 p-3 text-white transition-transform duration-300 rounded-full shadow-lg bottom-8 right-8 bg-sky-500 hover:bg-sky-600 shadow-sky-500/30 hover:scale-105"
          aria-label="Наверх"
        >
          ↑
        </button>
      )}
    </div>
  );
}
