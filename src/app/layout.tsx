import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "研究參與網站 - Research Participant Site",
  description: "Final Year Project Research Participation Website / 畢業專題研究參與網站",
};

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
