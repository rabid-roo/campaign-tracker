"use client";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <main
      id="main"
      className="mx-auto w-full max-w-6xl px-6 md:px-8"
    >
      <div className="border-b border-rule py-3">
        <p className="label">The record could not be read</p>
      </div>
      <section className="grid gap-6 py-16 md:grid-cols-[7rem_minmax(0,1fr)]">
        <p className="label">Error</p>
        <div className="reading">
          <h1 className="font-sans text-[clamp(1.75rem,3.2vw,2.35rem)] leading-[1.1] font-bold tracking-[-0.015em]">
            The tracker data did not come back
          </h1>
          <p className="mt-4 text-[1.0625rem] text-muted">
            The record is served from the live database, and this page could not
            read it. Try again in a moment.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            className="mt-8 inline-block border border-ink px-4 py-3 font-sans text-[0.8rem] font-semibold tracking-[0.12em] uppercase hover:bg-[var(--hover)]"
          >
            Try again
          </button>
          {error.digest && (
            <p className="refnum mt-6 text-[0.75rem] text-muted">
              Reference: {error.digest}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
