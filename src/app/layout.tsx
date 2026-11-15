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
              <Link href="/" className="hover:text-ink">
                Trackers
              </Link>
              <a
                href="https://github.com/rabid-roo/campaign-tracker"
                className="hover:text-ink"
              >
                Method
              </a>
            </nav>
          </div>
        </header>
        <div className="flex-1">{children}</div>
        <footer className="bleed mt-16">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-baseline justify-between gap-2 px-6 py-6 md:px-8">
            <p className="label">Source-linked record · updated as evidence is found</p>
            <p className="refnum text-xs text-muted">
              Not affiliated with any party
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
