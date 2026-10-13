'use client';

import { useEffect, useState } from 'react';
import Reveal from '@/components/style-sample/Reveal';
import FilmFrame from '@/components/style-sample/FilmFrame';
import DataRail from '@/components/style-sample/DataRail';
import ThemeToggle from '@/components/style-sample/ThemeToggle';
import {
  SADNESS_CLIPS,
  PROJECT,
  CONSENT_STATEMENTS,
  ERQ_SAMPLE,
  VIDEO_BASE,
} from '@/components/style-sample/sampleData';

const videoUrl = (f: string) => `${VIDEO_BASE}/${f}`;

export default function StyleSamplePage() {
  // Direction 03 flips the default. The ground is warm ivory paper; dark is
  // the alternate. The state is therefore `dark`, not `light` — a boolean
  // called `light` that is false in the default state invites inverted-logic
  // bugs at every use site.
  const [dark, setDark] = useState(false);
  const [activeClip, setActiveClip] = useState(0);
  const [scale, setScale] = useState<number | null>(null);
  const [ticked, setTicked] = useState<boolean[]>([false, false, false, false]);

  // ⚠️ The theme class is applied to <html>, NOT to a wrapper <div>.
  //
  // Verified in a real browser: rendering className on a wrapper element did
  // NOT update when the theme state changed. React state was provably updating
  // — the header's inline background flipped on the very same click — and the
  // clip-row state in the same component re-rendered fine. But the wrapper's
  // class attribute stayed put.
  //
  // Putting the class on <html> sidesteps the problem entirely and is the
  // standard approach for theming anyway. Cleaned up on unmount so navigating
  // back to the live site cannot leave the sample's theme behind — which
  // matters here, because both run on the same dev server and share
  // globals.css.
  useEffect(() => {
    const el = document.documentElement;
    el.classList.add('ss-root');
    el.classList.toggle('ss-dark', dark);
    return () => {
      el.classList.remove('ss-root', 'ss-dark');
    };
  }, [dark]);

  // Scroll progress. Written to the DOM directly rather than through React
  // state: scroll fires continuously, and a state update per frame would
  // re-render this entire page for a 2px line. The element scales on the X
  // axis, so this never triggers layout — only a composited transform.
  useEffect(() => {
    const el = document.querySelector('.ss-progress');
    if (!el) return;
    const update = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = h > 0 ? window.scrollY / h : 0;
      (el as HTMLElement).style.transform = `scaleX(${Math.min(1, Math.max(0, p))})`;
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  // Cursor-following warm highlight on cards.
  //
  // Written as CSS custom properties on the hovered card rather than React
  // state on purpose: mousemove fires ~60x/s, and putting that in state would
  // re-render this whole page every frame. Writing `--mx`/`--my` only
  // invalidates the card's ::after gradient, so the browser repaints one layer
  // and React does no work at all.
  //
  // Bound once on document with event delegation, so it costs nothing per card
  // and keeps working if the DOM below changes.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const onMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const card = target?.closest?.('.ss-glow-card') as HTMLElement | null;
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    document.addEventListener('mousemove', onMove, { passive: true });
    return () => document.removeEventListener('mousemove', onMove);
  }, []);

  // ⚠️ Magnetic buttons: the label shifts a few pixels toward the pointer, then
  // springs back. Kept to buttons only. On a questionnaire this is not
  // decoration — it confirms which target you are about to hit, which is worth
  // real accuracy on a 7-point scale.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const onMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const btn = target?.closest?.('.ss-btn') as HTMLElement | null;
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      btn.style.setProperty('--tx', `${dx * 5}px`);
      btn.style.setProperty('--ty', `${dy * 3}px`);
    };
    const onOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const btn = target?.closest?.('.ss-btn') as HTMLElement | null;
      if (!btn) return;
      btn.style.setProperty('--tx', '0px');
      btn.style.setProperty('--ty', '0px');
    };
    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseout', onOut, { passive: true });
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseout', onOut);
    };
  }, []);

  return (
    // No className here — `.ss-root` lives on <html> (see the effect above).
    // A stray `ss-root` class on this div would scope the CSS one level too
    // deep and, more importantly, would look like it controls the theme when
    // it does not.
    <div>
      {/* Scroll progress line. Fixed, 2px, scaleX only. */}
      <div className="ss-progress" aria-hidden="true" />

      {/* Paper grain. Fixed-position, pointer-events:none, zero layout cost —
          it only paints the grain and two faint earth-tone washes behind
          everything. Sits under the content, which is why the sections live in
          a `.ss-above` wrapper below. */}
      <div className="ss-paper" aria-hidden="true" />

      <div className="ss-above">
      {/* ── Sticky top bar ───────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 backdrop-blur-md"
        style={{
          background: dark ? 'rgba(23,17,12,0.80)' : 'rgba(251,247,240,0.82)',
          borderBottom: '1px solid var(--ss-line)',
        }}
      >
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-6 py-3.5 md:px-10">
          <div className="flex items-center gap-4">
            <span className="ss-mono ss-accent-text">Style Sample</span>
            <span className="ss-mono hidden sm:inline" style={{ opacity: 0.6 }}>
              / prototype 03 · warm paper · not live
            </span>
          </div>
          <ThemeToggle dark={dark} onChange={setDark} />
        </div>
      </header>

      {/* ── 01 · Hero ────────────────────────────────────────────────────── */}
      <section className="relative mx-auto max-w-[1400px] px-6 pt-20 pb-24 md:px-10 md:pt-28">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] lg:gap-20">
          {/* Left: the type block */}
          <div>
            <Reveal>
              <div className="mb-10 flex items-center gap-4 flex-wrap">
                <span className="ss-mono ss-accent-text">
                  {PROJECT.institution}
                </span>
                <span className="h-px flex-1" style={{ background: 'var(--ss-line)' }} />
                <span className="ss-mono">FYP · 2026</span>
              </div>
            </Reveal>

            {/* The headline is the whole design. One display size, three lines,
                a hard break, and a single accented word. Nothing else competes. */}
            <h1 className="ss-display ss-h1">
              <Reveal as="span" className="block">
                Sadness
              </Reveal>
              <Reveal as="span" className="block" delay={90}>
                <span style={{ fontStyle: 'italic', color: 'var(--ss-accent)' }}>Film</span> on
              </Reveal>
              <Reveal as="span" className="block" delay={180}>
                Resilience
              </Reveal>
            </h1>

            <Reveal delay={260}>
              {/* Display-scale Chinese title. Deliberately NOT `.ss-body`: that
                  class exists for reading copy, and using it here silently
                  overwrote both the size and the colour — the render check
                  measured 20px and a dim grey instead of the intended larger
                  display line. Set the scale explicitly instead. */}
              <p
                style={{
                  fontFamily: 'var(--ss-font-display)',
                  fontSize: 'clamp(1.25rem, 1.8vw, 1.55rem)',
                  lineHeight: 1.35,
                  color: 'var(--ss-ink)',
                  margin: '2.5rem 0 0',
                  maxWidth: '34ch',
                }}
              >
                {PROJECT.titleZh}
              </p>
              <p className="ss-small mt-3">
                A study of how mediated sadness is reflected on, and whether the way we
                reframe it is what actually builds resilience.
              </p>
            </Reveal>

            {/* The single CTA. No secondary button, no icon row — one decision. */}
            <Reveal delay={340}>
              <div className="mt-12 flex flex-wrap items-center gap-6">
                <button className="ss-btn ss-btn-solid" type="button">
                  Begin the study
                  <span aria-hidden>→</span>
                </button>
                <span className="ss-mono">
                  approx. 30 min · single sitting
                </span>
              </div>
            </Reveal>
          </div>

          {/* Right: the data rail. This replaces the three frosted-glass cards. */}
          <Reveal delay={200}>
            <div className="lg:pt-4">
              <p className="ss-mono mb-3">Study parameters</p>
              <DataRail
                items={[
                  { k: 'Clips', v: '04', note: 'not stated to participant' },
                  { k: 'Time', v: '~30 MIN' },
                  { k: 'Pre-test', v: '03', note: 'CD-RISC-10 · MLQ · ERQ' },
                  { k: 'Post-test', v: '03', note: 'CD-RISC-10 · MLQ · ERQ' },
                  { k: 'Design', v: 'BETWEEN', note: 'randomised, pre-assigned' },
                  { k: 'Record', v: 'ANON', note: 'ID only, no name' },
                ]}
              />
              <p className="ss-mono mt-4" style={{ lineHeight: 1.9, opacity: 0.8 }}>
                {PROJECT.researcher} · {PROJECT.supervisor}
                <br />
                {PROJECT.email}
              </p>
            </div>
          </Reveal>
        </div>

        {/* Marquee ticker — a thin band of running text. One of the cheapest,
            most recognisable "award site" moves, and it doubles as a genuine
            information slot. On paper it becomes a pressed band: a sunken
            warm fill rather than a lit one, with a soft fade at both edges so
            the text dissolves instead of being cut off. The fade is a mask, so
            it costs no layout. */}
        <Reveal delay={420}>
          <div
            className="mt-20 overflow-hidden py-3"
            style={{
              borderRadius: 999,
              background: 'var(--ss-bg-3)',
              border: '1px solid var(--ss-line)',
              maskImage:
                'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)',
              WebkitMaskImage:
                'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)',
            }}
          >
            <div className="ss-marquee-track">
              {[0, 1].map((dup) => (
                <span key={dup} className="ss-mono" style={{ paddingRight: '2.5rem' }}>
                  {[
                    'Aftersun',
                    'Didi',
                    'Manchester by the Sea',
                    'All About Lily Chou-Chou',
                    '·',
                    'CD-RISC-10',
                    'MLQ',
                    'ERQ',
                    '·',
                    'cognitive reappraisal',
                    'Gross, 1998',
                    '·',
                    'The Education University of Hong Kong',
                    'Department of Psychology',
                    '·',
                  ]
                    .map((t, i) => (
                      <span key={i} style={{ paddingRight: '2.5rem' }}>
                        {t}
                      </span>
                    ))}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── 02 · Film index ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-6 py-24 md:px-10">
        <Reveal>
          <div className="mb-12 flex items-end justify-between gap-8 flex-wrap">
            <div>
              <p className="ss-mono ss-eyebrow mb-4">01 — Bibliography</p>
              <h2 className="ss-display ss-h2">
                Four films, one <span style={{ fontStyle: 'italic' }}>question</span>
              </h2>
            </div>
            <p className="ss-small" style={{ maxWidth: '34ch' }}>
              Titles are withheld until after viewing. The clips are presented here so
              you can judge the layout, not to hint at the manipulation.
            </p>
          </div>
        </Reveal>

        {/* Selected clip gets the full cinema stage; the rest are an index.
            On the live site all four clips each get their own screenful — that
            is one of the things worth reconsidering. */}
        <Reveal delay={80}>
          <FilmFrame
            src={videoUrl(SADNESS_CLIPS[activeClip].src)}
            index={activeClip}
            total={SADNESS_CLIPS.length}
            title={SADNESS_CLIPS[activeClip].title}
            titleZh={SADNESS_CLIPS[activeClip].titleZh}
            duration={SADNESS_CLIPS[activeClip].duration}
          />
        </Reveal>

        <Reveal delay={160}>
          <div className="mt-12">
            {SADNESS_CLIPS.map((c, i) => (
              <div
                key={c.id}
                className={`ss-index-row ss-glow-card${i === activeClip ? ' ss-active' : ''}`}
                role="button"
                tabIndex={0}
                onClick={() => setActiveClip(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setActiveClip(i);
                }}
              >
                {/* The number is now a chip, filled when the row is active. A
                    coloured numeral alone was too quiet to read as "this one". */}
                <span className={`ss-chip${i === activeClip ? ' ss-chip-on' : ''}`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>
                  <span
                    className="ss-display"
                    style={{ fontSize: '1.6rem', display: 'block', lineHeight: 1.15 }}
                  >
                    {c.title}{' '}
                    <span style={{ color: 'var(--ss-ink-3)', fontSize: '1.1rem' }}>{c.titleZh}</span>
                  </span>
                  <span className="ss-mono block mt-2" style={{ textTransform: 'none', letterSpacing: '0.02em' }}>
                    {c.year} · excerpt {c.duration}
                  </span>
                </span>
                <span className="ss-mono">{i === activeClip ? 'Now playing' : 'Play'}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── 03 · Scale treatment ─────────────────────────────────────────── */}
      <section
        className="px-6 py-24 md:px-10"
        style={{
          background: 'var(--ss-bg-3)',
          borderTop: '1px solid var(--ss-line)',
          borderBottom: '1px solid var(--ss-line)',
        }}
      >
        <div className="mx-auto max-w-[1000px]">
          <Reveal>
            <p className="ss-mono ss-eyebrow mb-4">02 — Instrument</p>
            <h2 className="ss-display ss-h2 mb-4">
              Questionnaire, as <span style={{ fontStyle: 'italic' }}>instrumentation</span>
            </h2>
            <p className="ss-body mb-12">
              On the live site the ERQ rendered as a Google Form inside a white iframe.
              Everything above and below it looked like a designed website; the form
              itself looked like a Google Form. That mismatch is the single most
              noticeable break in the current design. A native scale removes it.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <div className="ss-panel p-6 md:p-9">
              <div className="mb-7 flex items-baseline justify-between gap-6 flex-wrap">
                <span className="ss-mono">ERQ · Cognitive Reappraisal</span>
                <span className="ss-mono">06 items · 1–7</span>
              </div>

              {ERQ_SAMPLE.map((q, qi) => (
                <div key={q.n} className="py-7" style={{ borderTop: qi === 0 ? '1px solid var(--ss-line)' : 'none' }}>
                  <div className="flex gap-5">
                    <span className="ss-mono shrink-0 pt-1 ss-accent-text">
                      {q.n}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        style={{
                          fontFamily: 'var(--ss-font-display)',
                          fontSize: '1.3rem',
                          lineHeight: 1.4,
                          color: 'var(--ss-ink)',
                          margin: 0,
                        }}
                      >
                        {q.en}
                      </p>
                      <p className="ss-small ss-small-tight mt-2">
                        {q.zh}
                      </p>

                      <div className="ss-scale mt-6" style={{ maxWidth: 620 }}>
                        {[1, 2, 3, 4, 5, 6, 7].map((v) => (
                          <button
                            key={v}
                            type="button"
                            className={`ss-scale-item${scale === v && qi === 0 ? ' ss-on' : ''}`}
                            onClick={() => setScale(v)}
                            aria-label={`${v}`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between gap-6 flex-wrap pt-7" style={{ borderTop: '1px solid var(--ss-line)' }}>
                <p className="ss-mono m-0" style={{ textTransform: 'none', letterSpacing: '0.04em' }}>
                  1 = strongly disagree · 7 = strongly agree
                </p>
                <button type="button" className="ss-btn" disabled={scale === null}>
                  Next item
                  <span aria-hidden>→</span>
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 04 · Consent ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-6 py-24 md:px-10">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
          <Reveal>
            <div className="lg:sticky lg:top-24">
              <p className="ss-mono ss-eyebrow mb-4">03 — Consent</p>
              <h2 className="ss-display ss-h2 mb-6">
                Informed consent, <span style={{ fontStyle: 'italic' }}>readable</span>
              </h2>
              <p className="ss-body mb-8">
                The consent sheet is the longest text block in the study, so it is where
                typography matters most. The proposal keeps the whole statement on screen
                with a document-like measure — around 62 characters — instead of a
                scrolling card cut at 46vh.
              </p>

              {/* The signature field, shown inline rather than as a separate form. */}
              <div className="ss-panel p-6">
                <p className="ss-mono mb-5">Signature</p>
                <label className="ss-mono block mb-2" htmlFor="ss-name">
                  Full name · 姓名
                </label>
                <input
                  id="ss-name"
                  className="ss-field"
                  placeholder="as it appears on your student card"
                />
                <label className="ss-mono block mt-7 mb-2" htmlFor="ss-date">
                  Date · 日期
                </label>
                <input id="ss-date" className="ss-field" placeholder="DD / MM / YYYY" />
                <p className="ss-mono mt-6" style={{ textTransform: 'none', letterSpacing: '0.04em' }}>
                  {PROJECT.participantId}
                </p>
              </div>
            </div>
          </Reveal>

          <div>
            <Reveal delay={80}>
              {/* ⚠️ The consent statements are marked up as <button>, not as
                  <div role="button">, even though the clip index below the
                  film uses the div form. The reason is that consent must be
                  operable by keyboard as a real form control — a native button
                  gets Space and Enter for free, reports itself correctly to
                  assistive tech, and can be reached with a single Tab. The
                  clip rows are a list selection where the div pattern reads
                  better; ticks are form controls, so they use the element. */}
              <div className="ss-panel ss-panel-3 p-7 md:p-10">
                <p className="ss-mono mb-2">{PROJECT.institution}</p>
                <h3
                  className="ss-display mb-8"
                  style={{ fontSize: '1.75rem', lineHeight: 1.2 }}
                >
                  Consent to participate in research
                </h3>

                {CONSENT_STATEMENTS.map((s, i) => (
                  <div
                    key={i}
                    className="grid gap-4 py-6 md:grid-cols-[2.5rem_1fr]"
                    style={{ borderTop: '1px solid var(--ss-line)' }}
                  >
                    <span className="ss-mono pt-1 ss-accent-text">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      {/* Slightly tighter than default body copy for the
                          consent statements. Done with a class rather than an
                          inline style so it does not silently defeat
                          `.ss-body` (inline styles win over sample.css). */}
                      <p className="ss-body ss-body-tight" style={{ color: 'var(--ss-ink)' }}>
                        {s.en}
                      </p>
                      <p className="ss-small ss-small-tight mt-2">
                        {s.zh}
                      </p>
                      {/* A per-statement tick. The live site has a single
                          checkbox for the whole sheet; per-statement ticks are
                          the model most ethics boards prefer, and they make the
                          four things being agreed to individually visible. */}
                      <button
                        type="button"
                        onClick={() =>
                          setTicked((t) => t.map((v, j) => (i === j ? !v : v)))
                        }
                        className="mt-4 inline-flex items-center gap-3"
                        style={{
                          background: 'transparent',
                          border: 0,
                          padding: 0,
                          cursor: 'pointer',
                          color: ticked[i] ? 'var(--ss-accent)' : 'var(--ss-ink-3)',
                        }}
                      >
                        <span
                          aria-hidden
                          className="ss-tick"
                          style={{
                            borderColor: ticked[i] ? 'var(--ss-accent)' : 'var(--ss-line-2)',
                            // Direction 03 inverts the tick text colour: the
                            // ground is light now, so an unticked box needs no
                            // ink and a ticked one needs near-white on the
                            // terracotta. In 02 it was the reverse.
                            color: ticked[i] ? '#fff8f0' : 'transparent',
                            background: ticked[i] ? 'var(--ss-accent)' : 'transparent',
                            transform: ticked[i] ? 'scale(1.1)' : 'scale(1)',
                            boxShadow: ticked[i]
                              ? '0 6px 14px -6px rgba(194,87,31,0.7)'
                              : 'none',
                          }}
                        >
                          {ticked[i] ? '✓' : ''}
                        </span>
                        <span className="ss-mono" style={{ textTransform: 'none', letterSpacing: '0.06em' }}>
                          I agree to this statement
                        </span>
                      </button>
                    </div>
                  </div>
                ))}

                <div
                  className="mt-8 pt-7 flex flex-wrap items-center justify-between gap-5"
                  style={{ borderTop: '1px solid var(--ss-line)' }}
                >
                  <span className="ss-mono">
                    {ticked.filter(Boolean).length} / {ticked.length} agreed
                  </span>
                  <button
                    type="button"
                    className="ss-btn ss-btn-solid"
                    disabled={!ticked.every(Boolean)}
                  >
                    Continue
                    <span aria-hidden>→</span>
                  </button>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 05 · Before / after ──────────────────────────────────────────── */}
      <section
        className="px-6 py-24 md:px-10"
        style={{ background: 'var(--ss-bg-3)', borderTop: '1px solid var(--ss-line)' }}
      >
        <div className="mx-auto max-w-[1100px]">
          <Reveal>
            <p className="ss-mono ss-eyebrow mb-4">04 — Rationale</p>
            <h2 className="ss-display ss-h2 mb-12">
              What actually changed, and <span style={{ fontStyle: 'italic' }}>why</span>
            </h2>
          </Reveal>

          <div className="grid gap-px md:grid-cols-2" style={{ background: 'var(--ss-line)' }}>
            {[
              {
                h: 'Ground',
                was: 'Dark ground in both earlier directions, hue-shifted',
                now: 'LIGHT warm ivory paper #FBF7F0, dark mode demoted to the alternate',
                why: 'Directions 01 and 02 both kept a dark ground and only changed its hue, which is why 02 still read as the same site. The ground is the single largest area on the page, so it is the only thing that can change the feel on its own.',
              },
              {
                h: 'Neutrals',
                was: 'Cool greys under a warm accent',
                now: 'Every neutral has R > B: #241A12 ink, #57493C, #8B7E6E',
                why: 'The warmth people perceive comes from the neutrals, not from the accent. A warm accent sitting on a cool ramp still reads cool. This is measurable — red channel greater than blue, on every single neutral, including in dark mode.',
              },
              {
                h: 'Accent',
                was: 'Pale gold #E8B65A glowing on black',
                now: 'Terracotta #C2571F — ink on paper rather than light on black',
                why: 'Gold on black is a signal colour: it reads as a light source. Terracotta reads as a printed mark. Same felt temperature, completely different register.',
              },
              {
                h: 'Type',
                was: 'High-contrast Didone display serif',
                now: 'Fraunces (soft old-style, optical sizing) against Inter',
                why: 'A Didone is elegant but fashion-editorial, and at 100px it is cold. Fraunces is a soft face; the SOFT and WONK axes let the display weight read as printed rather than drawn.',
              },
              {
                h: 'Response',
                was: 'Entrance animation only; nothing answered the pointer',
                now: 'Cursor-tracked highlight, magnetic buttons, drawing rules, press springs',
                why: 'The previous motion was all entrance — you watched it once and then the page was inert. Predictable response to the pointer is most of what makes a page feel friendly, and it is also feedback that reduces mis-clicks on a 7-point scale.',
              },
              {
                h: 'Paper',
                was: 'Flat fill, hairline borders',
                now: 'A faint grain overlay and a real shadow under every panel',
                why: 'A flat fill reads as a screen. Grain reads as a surface. It is a fixed, click-through layer, so it costs no layout and no interaction.',
              },
            ].map((row, i) => (
              <Reveal key={row.h} delay={i * 60}>
                <div className="h-full p-7 md:p-9" style={{ background: 'var(--ss-bg-2)' }}>
                  <p className="ss-mono ss-accent-text mb-5">
                    {row.h}
                  </p>

                  <p className="ss-mono mb-1" style={{ fontSize: '0.5625rem' }}>
                    Before
                  </p>
                  <p
                    className="mb-5"
                    style={{
                      color: 'var(--ss-ink-3)',
                      fontSize: '0.9375rem',
                      textDecoration: 'line-through',
                      textDecorationColor: 'var(--ss-line-2)',
                      margin: '0 0 1.25rem',
                    }}
                  >
                    {row.was}
                  </p>

                  <p className="ss-mono ss-accent-text mb-1" style={{ fontSize: '0.5625rem' }}>
                    Now
                  </p>
                  <p
                    style={{
                      color: 'var(--ss-ink)',
                      fontSize: '1.0625rem',
                      margin: '0 0 1.25rem',
                      fontFamily: 'var(--ss-font-display)',
                    }}
                  >
                    {row.now}
                  </p>

                  <p className="ss-small" style={{ fontSize: '0.875rem' }}>
                    {row.why}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 06 · Closing ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-6 py-28 md:px-10">
        <Reveal>
          <h2 className="ss-display ss-h1" style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)' }}>
            Thank you
            <br />
            <span style={{ fontStyle: 'italic', color: 'var(--ss-accent)' }}>for your time</span>
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <div className="mt-14 flex flex-wrap items-center gap-x-12 gap-y-6">
            <p className="ss-mono m-0" style={{ textTransform: 'none', letterSpacing: '0.04em' }}>
              Questions → {PROJECT.email}
              <br />
              Ethics concerns → {PROJECT.ethicsEmail}
            </p>
          </div>
        </Reveal>
        <Reveal delay={200}>
          <hr className="ss-rule mt-16" />
          <p className="ss-mono mt-6" style={{ opacity: 0.75 }}>
            Style sample · prototype 03 (warm paper) · nothing on this page is wired to the study
          </p>
        </Reveal>
      </section>
      </div>
    </div>
  );
}
