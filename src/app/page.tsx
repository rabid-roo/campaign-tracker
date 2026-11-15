import Link from "next/link";
import { getAllStatusCounts, getLatestActivityDate, getParties } from "@/lib/supabase/data";

export const revalidate = 300;

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function Home() {
  const [parties, statusCounts, latestUpdate] = await Promise.all([
    getParties(),
    getAllStatusCounts(),
    getLatestActivityDate(),
  ]);

  const totals = parties.map((party) => {
    const counts = statusCounts[party.id] ?? {};
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return {
      party,
      total,
      completed: counts.completed ?? 0,
      inProgress: counts.in_progress ?? 0,
    };
  });

  return (
    <main className="mx-auto w-full max-w-6xl px-6 md:px-8">
      <section className="grid gap-10 py-12 md:grid-cols-[1fr_20rem] md:items-end md:py-16">
        <div>
          <h1 className="max-w-[20ch] font-sans text-[clamp(2.3rem,5.4vw,3.6rem)] leading-[1.03] font-bold tracking-[-0.02em]">
            Campaign promise tracker
          </h1>
          <p className="reading mt-6 text-[1.0625rem] leading-relaxed">
            Every itemized promise from a published platform, with a dated
            record of what government did about it and the source behind each
            change. No score, no verdict — the evidence is the argument.
          </p>
        </div>
        <dl className="border-l border-rule pl-6 font-mono text-[0.8rem] leading-relaxed text-muted">
          <dt className="label">Examination date</dt>
          <dd className="mb-3 text-ink">{formatDate(latestUpdate) || "—"}</dd>
          <dt className="label">Standing</dt>
          <dd className="text-ink">
            Provisional — all promises are still under review and
            categorization.
          </dd>
        </dl>
      </section>

      <section className="bleed bleed-strong pt-8">
        <h2 className="label">Trackers in the record</h2>
        <ul className="mt-4">
          {totals.map(({ party, total, completed, inProgress }) => (
            <li key={party.id}>
              <Link
                href={`/party/${party.slug}`}
                className="ledger-row grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 border-t border-rule px-1 py-6 md:grid-cols-[minmax(0,1fr)_6rem_6rem_8rem_2rem]"
              >
                <div className="min-w-0">
                  <h3 className="font-sans text-[1.35rem] font-semibold leading-tight">
                    {party.name}
                  </h3>
                  <p className="mt-1 text-[0.9rem] text-muted">{party.election}</p>
                  <p className="refnum mt-2 text-[0.75rem] text-muted md:hidden">
                    {total} findings · {completed} delivered · {inProgress} in
                    progress
                  </p>
                </div>
                <div className="hidden md:block">
                  <p className="refnum text-[0.95rem]">{total}</p>
                  <p className="label">findings</p>
                </div>
                <div className="hidden md:block">
                  <p className="refnum text-[0.95rem]">{completed}</p>
                  <p className="label">delivered</p>
                </div>
                <div className="hidden text-right md:block">
                  <p className="refnum text-[0.8rem] text-muted">
                    {inProgress} in progress
                  </p>
                </div>
                <span
                  aria-hidden="true"
                  className="hidden font-sans text-[1.1rem] md:block"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="bleed mt-14 grid gap-6 pt-8 md:grid-cols-[14rem_minmax(0,1fr)]">
        <h2 className="label">How this record is made</h2>
        <div className="reading">
          <p>
            Platform text is itemized into promises, then each promise is
            checked against council agendas and minutes, Hansard, provincial
            news and archived pages. A status changes only when a linkable
            source supports it, and the source is printed with the change.
          </p>
          <p className="mt-4 text-[0.92rem] text-muted">
            A promise marked in progress records that action began — not that
            the result was delivered. Absence of a record means no action was
            found, not that the promise was abandoned.
          </p>
        </div>
      </section>
    </main>
  );
}
