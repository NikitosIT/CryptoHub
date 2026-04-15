import { useEffect, useState } from 'react';

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

export function useScrollTop(threshold = 400) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let frameId = 0;

    const updateVisibility = () => {
      const nextShow = window.scrollY > threshold;
      setShow((prev) => (prev === nextShow ? prev : nextShow));
      frameId = 0;
    };

    const handleScroll = () => {
      if (frameId !== 0) return;
      frameId = window.requestAnimationFrame(updateVisibility);
    };

    updateVisibility();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [threshold]);

  return { show, scrollToTop };
}
