import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "研究參與網站 - Research Participant Site",
  description: "Final Year Project Research Participation Website / 畢業專題研究參與網站",
};

// ⚠️ Do NOT re-add `next/font/google` here.
//
// The /style-sample prototype used to declare Fraunces, Inter and IBM Plex Mono
// here (via next/font/google) and expose them as --ss-font-* variables. They were
// removed for two reasons:
//
//   1. They made the DEV SERVER fetch fonts from Google on every start. next/font
//      downloads and self-hosts font files at build/dev time, so the Node process
//      itself makes an outbound request (Google serves them via
//      redirector.gvt1.com). That request is what the sandbox kept stopping to ask
//      about — the browser never caused it, because the site's own fonts come from
//      the CSS @import at the top of globals.css, which the BROWSER fetches.
//   2. They cost every visitor three font families that only the unused prototype
//      reads. The study site itself uses Playfair Display + Inter, both already
//      loaded by that @import.
//
// The prototype still renders: sample.css declares fallback stacks for the same
// three variables. If the prototype's typography is ever wanted back, the honest
// way is to declare the fonts inside the prototype's own layout (src/app/
// style-sample/layout.tsx) so the study pages do not pay for them — and to accept
// the dev-server font fetch coming back.

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

