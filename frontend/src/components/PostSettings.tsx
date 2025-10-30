import { useInfinitePosts } from "@/api/useInfinitePosts";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useScrollTop } from "@/hooks/useScrollTop";
import FeedSkeleton from "./FeedSkeleton";
import { PostCard } from "./PostCard";
interface PostListProps {
  mode?: "all" | "liked";
  userId?: string | null;
  authorId?: number | null;
  tokenName?: string | null;
}
export default function PostList({
  mode = "all",
  userId,
  authorId,
  tokenName,
}: PostListProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfinitePosts({
      authorId,
      tokenName,
      mode,
      userId,
    });

  const observerRef = useInfiniteScroll({ hasNextPage, fetchNextPage });
  const { show: showScrollTop, scrollToTop } = useScrollTop();

  const posts = data?.pages.flat() ?? [];
  if (isLoading) return <FeedSkeleton />;
  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      <div ref={observerRef} />
      {isFetchingNextPage && <FeedSkeleton />}
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
