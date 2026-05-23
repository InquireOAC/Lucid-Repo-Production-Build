import { useEffect, useRef, useState } from "react";

export function useInViewAutoplay<T extends HTMLElement>(threshold = 0.5) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting && entry.intersectionRatio >= threshold),
      { threshold: [0, threshold, 1] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return { ref, inView };
}