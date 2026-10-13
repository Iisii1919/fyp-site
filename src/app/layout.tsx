import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "研究參與網站 - Research Participant Site",
  description: "Final Year Project Research Participation Website / 畢業專題研究參與網站",
};

// Typefaces used ONLY by the isolated /style-sample prototype. Declared here
// rather than inside the sample's own layout because Next only hoists font
// declarations from a layout that also declares <html>/<body>; declaring them
// in the nested layout would emit them per-navigation. The variables are inert
// everywhere — sample.css is the only stylesheet that reads them.
//
// Chosen for contrast, not fashion: an editorial serif for the display voice,
// a neutral grotesque for reading, and a mono for the study metadata that
// should read as instrumentation rather than prose.
//
// Fraunces (direction 03) rather than Instrument Serif (01/02). Instrument
// Serif is a high-contrast Didone — elegant, but it reads as fashion editorial
// and it is cold at large sizes, which is exactly the note the earlier
// directions were criticised for. Fraunces is a soft "old-style" face with
// optical sizing and the SOFT / WONK axes; at a display size it reads as
// printed ink. `axes` is required for Fraunces because it is a variable font
// on more than the weight axis — without it the SOFT/WONK settings in
// sample.css are silently ignored.
const ssDisplay = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--ss-font-display",
  axes: ["SOFT", "WONK"],
});
const ssSans = Inter({ subsets: ["latin"], display: "swap", variable: "--ss-font-sans" });
const ssMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], display: "swap", variable: "--ss-font-mono" });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased ${ssDisplay.variable} ${ssSans.variable} ${ssMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
