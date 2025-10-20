import { useEffect, useRef } from "react";

interface Options {
    hasNextPage: boolean;
    fetchNextPage: () => void;
    rootMargin?: string;
}

export function useInfiniteScroll(
    { hasNextPage, fetchNextPage, rootMargin = "400px" }: Options,
) {
    const observerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!hasNextPage) return;
        const el = observerRef.current;
        if (!el) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) fetchNextPage();
        }, { rootMargin });

        observer.observe(el);
        return () => observer.disconnect();
    }, [hasNextPage, fetchNextPage, rootMargin]);

    return observerRef;
}
