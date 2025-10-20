import { useEffect, useState } from "react";

export function useScrollTop(threshold = 400) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const handleScroll = () => setShow(window.scrollY > threshold);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [threshold]);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    return { show, scrollToTop };
}
