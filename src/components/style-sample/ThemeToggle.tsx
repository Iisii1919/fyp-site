'use client';

import { useState } from 'react';

/**
 * Theme control for the sample.
 *
 * Direction 03 inverts what this means. The ground is now LIGHT by default
 * (warm ivory paper), and dark mode is the alternate. So the boolean is
 * `dark`, not `less light` — the prop was renamed to match, because a prop
 * called `light` that is false in the default state is a bug waiting to
 * happen in every call site that reads it.
 *
 * Two reasons this control is here rather than in a corner of the page:
 *
 *  1. It is genuinely useful. The current site is dark-only. Whether the new
 *     direction should be light-only, dark-only, or both is a real decision,
 *     and it is much easier to make while looking at both.
 *
 *  2. It is the honest thing to do for this particular study. A participant
 *     who finds high-contrast content uncomfortable should not have to
 *     complete a mood-induction procedure in a theme that makes it worse.
 *     Offering the choice costs almost nothing.
 */
export default function ThemeToggle({
  dark,
  onChange,
}: {
  dark: boolean;
  onChange: (v: boolean) => void;
}) {
  const [hover, setHover] = useState(false);

  return (
    <button
      type="button"
      onClick={() => onChange(!dark)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-pressed={!dark}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.6rem',
        background: hover ? 'var(--ss-accent-soft)' : 'transparent',
        border: `1px solid ${hover ? 'var(--ss-accent-line)' : 'var(--ss-line)'}`,
        borderRadius: 999,
        color: hover ? 'var(--ss-ink)' : 'var(--ss-ink-2)',
        padding: '0.55rem 1rem',
        cursor: 'pointer',
        fontFamily: 'var(--ss-font-mono)',
        fontSize: '0.625rem',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        transition:
          'background-color 0.28s var(--ss-ease), border-color 0.28s var(--ss-ease), color 0.28s var(--ss-ease)',
      }}
    >
      {/* A tiny pill switch. The knob slides on a spring so the control has the
          same physical feel as every other interactive element on the page. */}
      <span
        aria-hidden
        style={{
          display: 'inline-flex',
          width: 30,
          height: 16,
          borderRadius: 999,
          background: 'var(--ss-bg-3)',
          border: '1px solid var(--ss-line-2)',
          position: 'relative',
          padding: 1,
          boxSizing: 'content-box',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 1,
            width: 14,
            height: 14,
            borderRadius: 999,
            left: dark ? 16 : 1,
            background: 'var(--ss-accent)',
            boxShadow: '0 2px 8px -2px rgba(194,87,31,0.7)',
            transition: 'left 0.4s var(--ss-spring)',
          }}
        />
      </span>
      {dark ? 'Dark' : 'Light'}
    </button>
  );
}
