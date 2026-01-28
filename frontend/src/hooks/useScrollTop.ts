import { useEffect, useState } from "react";
const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
export function useScrollTop(threshold = 400) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShow(window.scrollY > threshold);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return { show, scrollToTop };
}
