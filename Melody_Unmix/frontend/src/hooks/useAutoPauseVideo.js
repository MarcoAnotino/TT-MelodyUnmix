// src/hooks/useAutoPauseVideo.js
import { useEffect } from "react";

export function useAutoPauseVideo(ref, { threshold = 0.6 } = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respeta "reduced motion"
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      el.pause();
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!el) return;
        if (entry.isIntersecting) {
          el.play().catch(() => {/* silencioso: autoplay puede fallar */});
        } else {
          el.pause();
        }
      },
      { threshold }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold]);
}
