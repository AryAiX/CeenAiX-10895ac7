import { useEffect, useRef, useState } from 'react';

/**
 * IntersectionObserver-based reveal hook. Ported verbatim from the Bolt
 * reference LandingPage.tsx (`useInView`) so reveal timing / threshold
 * behaviour stays byte-identical to the design reference.
 *
 * Example:
 *   const { ref, inView } = useInView(0.1);
 *   <section ref={ref} className={inView ? 'animate-slideUp' : 'opacity-0'}>
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(threshold = 0.15) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, inView };
}
