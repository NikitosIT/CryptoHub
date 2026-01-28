import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

export function useInfiniteScroll({
  hasNextPage,
  fetchNextPage,
}: {
  hasNextPage: boolean;
  fetchNextPage: () => void;
}) {
  const { ref, inView } = useInView({
    rootMargin: "400px",
    triggerOnce: false,
  });
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);
  return ref;
}
