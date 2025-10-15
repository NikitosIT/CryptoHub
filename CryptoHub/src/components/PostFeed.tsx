import { useEffect, useRef, useState } from "react";
import { useInfinitePosts } from "@/utils/TestLazyLoad";
import { FeedSkeleton } from "@/components/FeedSkeleton";
import { TelegramCaption } from "./PostBody";

export function PostFeed() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfinitePosts();
  const observerRef = useRef<HTMLDivElement | null>(null);

  const posts = data?.pages.flat() ?? [];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) setShowScrollTop(true);
      else setShowScrollTop(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!hasNextPage) return;
    const el = observerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "400px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) return <FeedSkeleton />;

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div key={post.id} className="p-4 border shadow-sm rounded-xl">
          <TelegramCaption post={post} />
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
