import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useScrollTop } from "@/hooks/useScrollTop";
import FeedSkeleton from "./FeedSkeleton";
import { PostCard } from "./PostCard";

import { useTelegramPosts } from "@/api/useTelegramPosts";
interface PostListProps {
  mode?: "all" | "liked" | "disliked" | "favorites";
  userId?: string | null;
  authorId?: number | null;
  tokenName?: string | null;
}
export default function PostsList({
  mode = "all",
  userId,
  authorId,
  tokenName,
}: PostListProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useTelegramPosts({
      authorId,
      tokenName,
      mode,
      userId,
    });

  const observerRef = useInfiniteScroll({ hasNextPage, fetchNextPage });
  const { show: showScrollTop, scrollToTop } = useScrollTop();

  const posts = data?.pages.flat() ?? [];
  // useInitReactions(posts);
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
