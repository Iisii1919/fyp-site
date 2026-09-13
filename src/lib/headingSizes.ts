// Heading sizes that actually take effect.
//
// The problem: `globals.css` declares
//
//     h1, h2, h3, h4 { ... }
//     h1 { font-size: clamp(2.5rem, 6vw, 4.5rem); }   /* 72px on a desktop */
//     h2 { font-size: clamp(1.75rem, 4vw, 2.75rem); } /* 44px */
//     h3 { font-size: clamp(1.25rem, 2.5vw, 1.75rem); } /* 28px */
//
// OUTSIDE any `@layer`. Under the cascade-layer rules an unlayered rule always beats
// a layered one **regardless of specificity**, so every Tailwind `text-*` class on a
// heading is silently ignored. A `<h1 className="text-3xl">` (asking for 30px) renders
// at 72px, and `<h3 className="text-base">` (16px) renders at 28px.
//
// Inline styles are the only thing that wins against an unlayered rule, short of
// editing globals.css -- and editing globals.css is risky because the Hero's
// `--hero-gap` rhythm was tuned around the current sizes. So the sizes the author
// actually asked for are restated here as inline styles, using `clamp()` to keep them
// responsive exactly as the original `text-3xl md:text-4xl` pairs were.
//
// Only the headings where the override is clearly wrong are fixed (see the audit in
// the daily log). Deliberate display headings -- Hero, GroupGate, VideoViewer, the
// ThankYou page -- are left alone.
//
// Rule of thumb for anything new: a Tailwind `text-*` class on a heading does NOT work.
// Spread one of these instead, or add the size you need here.
import type { CSSProperties } from 'react';

/** `text-3xl md:text-4xl` -- page titles on the form screens. Was rendering 72px. */
export const H1_PAGE: CSSProperties = { fontSize: 'clamp(1.875rem, 3.5vw, 2.25rem)' };

/** `text-xl md:text-2xl` -- the gold Chinese subtitle under a page title. Was 44px. */
export const H2_PAGE: CSSProperties = { fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)' };

/** `text-2xl md:text-3xl` -- "Information Sheet" on the consent screen. Was 72px. */
export const H1_SHEET: CSSProperties = { fontSize: 'clamp(1.5rem, 3vw, 1.875rem)' };

/** `text-base md:text-lg` -- headings inside the information sheet. Was 28px (15 of them). */
export const H3_SHEET: CSSProperties = { fontSize: 'clamp(1rem, 1.5vw, 1.125rem)' };

/** `text-base` -- sheet section titles, 16px at every width. Was 28px. */
export const H3_SHEET_FLAT: CSSProperties = { fontSize: '1rem' };
