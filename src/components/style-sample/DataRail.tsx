'use client';

/**
 * The "instrumentation rail": study metadata rendered as monospace data.
 *
 * Why this exists: the live Hero explains the study with three frosted-glass
 * cards ("Watch Videos / Complete Tasks / Research Study"). Those are
 * marketing-card language and they say nothing verifiable. A participant
 * deciding whether to give up half an hour is better served by facts,
 * presented in a form that reads as measurement rather than sales.
 */
export default function DataRail({
  items,
  className = '',
}: {
  items: { k: string; v: string; note?: string }[];
  className?: string;
}) {
  return (
    // Rounded container with the hairline grid still drawn by gap-px.
    // ⚠️ `overflow: hidden` on the wrapper is NOT enough on its own: the rows
    // paint their own opaque background and the wrapper's radius only clips at
    // the outer boundary, so with 1px gaps the corners still read square.
    // The first and last rows therefore carry the matching radius themselves.
    // No padding, gap or row height is changed — the approved layout is intact.
    //
    // Direction 03: the rail is now a warm raised card with a real shadow
    // rather than a hairline box on black. Radius 22 to match `.ss-panel`;
    // the inner rows use 21 so the 1px gap does not show a seam.
    <dl
      className={`grid gap-px ${className}`}
      style={{
        background: 'var(--ss-line)',
        borderRadius: 22,
        border: '1px solid var(--ss-line)',
        overflow: 'hidden',
        boxShadow: 'var(--ss-shadow)',
      }}
    >
      {items.map((it, i) => (
        <div
          key={it.k}
          className="ss-glow-card flex items-baseline justify-between gap-6 px-5 py-4"
          style={{
            background: 'var(--ss-bg-2)',
            borderTopLeftRadius: i === 0 ? 21 : 0,
            borderTopRightRadius: i === 0 ? 21 : 0,
            borderBottomLeftRadius: i === items.length - 1 ? 21 : 0,
            borderBottomRightRadius: i === items.length - 1 ? 21 : 0,
            transition: 'background-color var(--ss-t-fast) var(--ss-ease)',
          }}
        >
          <dt className="ss-mono">{it.k}</dt>
          <dd className="text-right m-0">
            <span
              style={{
                fontFamily: 'var(--ss-font-mono)',
                fontSize: '0.9375rem',
                color: 'var(--ss-ink)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {it.v}
            </span>
            {it.note && (
              <span className="ss-mono block mt-0.5" style={{ fontSize: '0.625rem' }}>
                {it.note}
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
