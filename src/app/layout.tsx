import type { Metadata } from "next";
import { Archivo, Spectral, Courier_Prime } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const spectral = Spectral({
  variable: "--font-spectral",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const courier = Courier_Prime({
  variable: "--font-courier",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Campaign Promise Tracker",
  description: "Itemized election promises and their delivery status.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${archivo.variable} ${spectral.variable} ${courier.variable} flex min-h-dvh flex-col bg-paper text-ink antialiased`}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-10 focus:border focus:border-ink focus:bg-paper focus:px-4 focus:py-2 focus:font-sans focus:text-[0.8rem] focus:font-semibold focus:tracking-[0.12em] focus:uppercase"
        >
          Skip to the record
        </a>
        <header className="bleed bleed-strong bg-paper">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-baseline justify-between gap-x-6 gap-y-2 px-6 py-4 md:px-8">
            <Link
              href="/"
              className="font-sans text-[0.95rem] font-bold tracking-[0.14em] uppercase"
            >
              Campaign Promise Tracker
            </Link>
            <nav
              aria-label="Trackers"
              className="flex items-baseline gap-5 font-sans text-[0.8rem] text-muted"
            >
              <Link href="/" className="inline-block py-1 hover:text-ink">
                Trackers
              </Link>
              <Link href="/#method" className="inline-block py-1 hover:text-ink">
                Method
              </Link>
            </nav>
          </div>
        </header>
        <div className="flex-1">{children}</div>
        <footer className="bleed mt-16">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-baseline justify-between gap-2 px-6 py-6 md:px-8">
            <p className="label">Source-linked record · updated as evidence is found</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
