import { useEffect, useState } from 'react';

/**
 * Count-up animation hook. Ported verbatim from the Bolt reference
 * LandingPage.tsx (`useCounter`) — ~60fps step (16ms), finishes at `duration`,
 * snaps to the exact target on completion. Only fires while `active` is true,
 * so it should be wired to a useInView result.
 */
export function useCounter(target: number, active: boolean, duration = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [active, target, duration]);

  return count;
}
