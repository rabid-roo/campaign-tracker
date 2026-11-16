import Link from "next/link";
import { ArrowLeft } from "@/components/arrows";

export default function PromiseNotFound() {
  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-6 md:px-8">
      <div className="border-b border-rule py-3">
        <p className="label">The record ends here</p>
      </div>
      <section className="grid gap-6 py-16 md:grid-cols-[7rem_minmax(0,1fr)]">
        <p className="label">404</p>
        <div className="reading">
          <h1 className="font-sans text-[clamp(1.75rem,3.2vw,2.35rem)] leading-[1.1] font-bold tracking-[-0.015em]">
            No promise at this address
          </h1>
          <p className="mt-4 text-[1.0625rem] text-muted">
            The promise may have been removed, or its party is not published on
            the site yet.
          </p>
          <Link
            href="/"
            className="mt-8 inline-block border border-ink px-4 py-3 font-sans text-[0.8rem] font-semibold tracking-[0.12em] uppercase hover:bg-[var(--hover)]"
          >
            <ArrowLeft className="mr-2" />
            Back to the trackers
          </Link>
        </div>
      </section>
    </main>
  );
}
