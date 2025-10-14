// Здесь я настроил ленту постов с возможностью автоподгрузки постов с помощью intersection observer
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { TelegramCaption } from "./PostBody";
import { FeedSkeleton } from "@/components/FeedSkeleton";

export function PostFeed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // === Загрузка постов ===
  useEffect(() => {
    loadPosts(true);
  }, []);

  async function loadPosts(reset = false) {
    if (reset) setLoading(true);
    const from = reset ? 0 : page * 10;
    const to = from + 9;

    const { data, error } = await supabase
      .from("telegram_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) console.error(error);

    if (data) {
      if (reset) setPosts(data);
      else setPosts((prev) => [...prev, ...data]);
    }

    setLoading(false);
    setLoadingMore(false);
  }

  // === Автоподгрузка ===
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && !loading) {
          setLoadingMore(true);
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1.0 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loading, loadingMore]);

  useEffect(() => {
    if (page > 0) loadPosts(false);
  }, [page]);

  // === Pull-to-refresh в мобилке ===
  useEffect(() => {
    let startY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) startY = e.touches[0].clientY;
    };
    const handleTouchEnd = async (e: TouchEvent) => {
      const endY = e.changedTouches[0].clientY;
      if (endY - startY > 100 && !refreshing) {
        setRefreshing(true);
        await loadPosts(true);
        setRefreshing(false);
      }
    };
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [refreshing]);

  // === Показ / скрытие кнопки “Наверх ↑” ===
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) setShowScrollTop(true);
      else setShowScrollTop(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // === Плавный скролл вверх ===
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col items-center pt-4 pb-10">
      {/* === Pull-to-refresh анимация === */}
      {refreshing && (
        <div className="text-sky-500 animate-pulse mb-2 text-sm">
          🔄 Обновление ленты...
        </div>
      )}

      {/* === Лента === */}
      {loading ? (
        <FeedSkeleton />
      ) : (
        posts.map((post) => <TelegramCaption key={post.id} post={post} />)
      )}

      {/* === Индикатор подгрузки === */}
      <div ref={loaderRef} className="py-6 text-neutral-500">
        {loadingMore && "Загрузка..."}
      </div>

      {/* === Кнопка "Наверх ↑" === */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-50 right-6 z-50
                     bg-sky-500 hover:bg-sky-600 text-white
                     shadow-lg shadow-sky-500/30
                     rounded-full p-3 transition-all duration-300
                     hover:scale-105"
          aria-label="Наверх"
        >
          ↑
        </button>
      )}
    </div>
  );
}
