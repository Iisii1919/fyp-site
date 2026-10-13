'use client';

/**
 * The film-frame video player for the style sample.
 *
 * This is the single highest-leverage change in the whole proposal. On the live
 * site a clip is one half of a two-column row: the video is boxed, small, and
 * shares attention with a wall of body copy. Here the clip gets a full-bleed
 * cinematic stage — the thing participants are actually here to do is watch
 * the film, so the layout should say so.
 */
export default function FilmFrame({
  src,
  poster,
  index,
  total,
  title,
  titleZh,
  duration,
  onEnded,
}: {
  src: string;
  poster?: string;
  index: number;
  total: number;
  title: string;
  titleZh: string;
  duration: string;
  onEnded?: () => void;
}) {
  return (
    <figure className="m-0">
      {/* Frame header: reads like a slate / clapperboard label. */}
      <figcaption className="flex items-baseline justify-between gap-4 mb-3">
        <span className="ss-mono" style={{ color: 'var(--ss-accent)' }}>
          Clip {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
        <span className="ss-mono">{duration}</span>
      </figcaption>

      <div className="ss-frame">
        {/* Letterbox bars sit ABOVE the video but are pointer-events:none, so
            they never eat a click on the native controls. */}
        <div className="ss-letterbox ss-top" aria-hidden />
        <div className="ss-letterbox ss-bottom" aria-hidden />

        <div className="ss-sprockets" aria-hidden>
          {Array.from({ length: 11 }).map((_, i) => (
            <i key={i} />
          ))}
        </div>

        <video
          src={src}
          poster={poster}
          controls
          playsInline
          preload="metadata"
          onEnded={onEnded}
          className="block w-full h-auto"
          style={{ background: '#000' }}
        />
      </div>

      {/* Caption below the frame, in editorial style. */}
      <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="ss-display ss-h3 italic" style={{ fontWeight: 400 }}>
          {title}
        </h3>
        {/* NOTE: no inline fontSize here. An inline style beats every CSS rule,
            so writing `fontSize: '1rem'` on a `.ss-body` element made the class
            look broken while it was actually fine — and it made the rendered
            size invisible to anyone reading sample.css. The dim colour is the
            only thing this caption needs to change, and colour is set by
            `.ss-caption`, not overridden inline. */}
        <span className="ss-body ss-caption">
          {titleZh}
        </span>
      </div>
    </figure>
  );
}
