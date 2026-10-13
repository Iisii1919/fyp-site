// ─────────────────────────────────────────────────────────────────────────────
// Style sample — an ISOLATED design proposal. Nothing here is imported by the
// live site, and the live site imports nothing from here.
//
// Why a separate route:
//   * `src/app/layout.tsx` loads `globals.css`, which declares `h1..h4` / `p`
//     font sizes OUTSIDE any @layer. Unlayered rules beat @layer utilities, so
//     every Tailwind `text-*` class on a heading inside the real app is ignored
//     (see src/lib/headingSizes.ts). That single rule is why the real site
//     needed 30-odd inline-style overrides.
//   * To propose a new look honestly we need a stylesheet we fully control.
//     `sample.css` is written as plain, specific CSS with NO unlayered element
//     selectors, so normal utility classes behave normally.
//
// ⚠️ `.ss-root` is NOT rendered here. It is applied to <html> from page.tsx.
// Measured in a real browser: putting the theme class on a wrapper element in
// this route did not update on a state change (React updated the header's
// inline style on the same click, but left the wrapper's class attribute
// alone). <html> is both more reliable and the conventional place for a theme.
// Direction 03 adds `ss-dark` as a SECOND class on the same element.
//
// The remaining caveat, and it is a real one: /style-sample shares a dev server
// and a root layout with the live site, so globals.css is still in effect.
// Sample rules are scoped under `.ss-root` and are deliberately *more specific*
// than the globals element rules, so they win regardless of layer — which keeps
// the two designs from bleeding into each other in either direction.
// ─────────────────────────────────────────────────────────────────────────────
import './sample.css';

export default function StyleSampleLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
