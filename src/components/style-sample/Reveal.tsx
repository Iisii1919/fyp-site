'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Reveal-on-scroll wrapper for the style sample.
 *
 * Deliberately implemented with a plain IntersectionObserver rather than
 * framer-motion: motion is already a dependency, but the sample has to stay
 * self-contained so it can be lifted into the real site (or thrown away)
 * without dragging a component library along with it.
 */
export default function Reveal({
  children,
  delay = 0,
  className = '',
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'li' | 'span';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // If the element is already on screen at mount there is nothing to reveal,
    // so show it immediately instead of waiting for a scroll that never comes.
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.9) {
      setShown(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      // `ss-settle-in` (direction 03) rather than `ss-warm-in` (02) or
      // `ss-blur-in` (01). All three keyframes remain in sample.css so the
      // directions can still be compared side by side; the difference is that
      // 03 adds a small scale plus a blur release, so elements settle onto the
      // paper instead of sliding across it.
      className={`${className} ss-settle-in`}
      style={{
        animationPlayState: shown ? 'running' : 'paused',
        animationDelay: `${delay}ms`,
        opacity: shown ? undefined : 0,
      }}
    >
      {children}
    </Tag>
  );
}
