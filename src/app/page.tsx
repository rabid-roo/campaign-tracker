import Link from "next/link";
import { ArrowRight } from "@/components/arrows";
import {
  getParties,
  getTrackerSummaries,
  type TrackerSummary,
} from "@/lib/supabase/data";
import { STATUSES, STATUS_LABELS } from "@/lib/status";

export const revalidate = 300;

const EMPTY: TrackerSummary = {
  total: 0,
  counts: {},
  examined: 0,
  latestReviewedOn: null,
};

const SEGMENT: Record<(typeof STATUSES)[number], string> = {
  not_started: "bg-rule",
  in_progress: "bg-alert",
  partially_complete: "bg-accent/40",
  completed: "bg-accent",
  cancelled: "bg-muted",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(iso);
  const d = new Date(dateOnly ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function Count({ value, label }: { value: number | string; label: string }) {
  return (
    <div>
      <p
        className={`refnum text-[1.35rem] leading-none ${
          value === 0 || value === "—" ? "text-muted" : "text-ink"
        }`}
      >
        {value}
      </p>
      <p className="label mt-1 lg:hidden">{label}</p>
    </div>
  );
}

function Distribution({
  counts,
  total,
  unexamined,
}: {
  counts: Record<string, number>;
  total: number;
  unexamined: number;
}) {
  if (total === 0) return null;
  return (
    <div
      aria-hidden="true"
      className="mt-4 flex h-1.5 w-full overflow-hidden border-y border-rule-strong/40"
    >
      {unexamined > 0 && (
        <span
          title={`Not examined: ${unexamined}`}
          className="bg-rule/50 border-r border-paper last:border-r-0"
          style={{ width: `${(unexamined / total) * 100}%` }}
        />
      )}
      {STATUSES.map((status) => {
        const count = counts[status] ?? 0;
        if (count === 0) return null;
        return (
          <span
            key={status}
            title={`${STATUS_LABELS[status]}: ${count}`}
            className={`${SEGMENT[status]} border-r border-paper last:border-r-0`}
            style={{ width: `${(count / total) * 100}%` }}
          />
        );
      })}
    </div>
  );
}

export default async function Home() {
  const [parties, summaries] = await Promise.all([
    getParties(),
    getTrackerSummaries(),
  ]);

  const rows = parties.map((party) => ({
    party,
    summary: summaries[party.id] ?? EMPTY,
  }));
  const totalFindings = rows.reduce((n, r) => n + r.summary.total, 0);
  const examined = rows.reduce((n, r) => n + r.summary.examined, 0);
  const latestReview = rows.reduce<string | null>((latest, r) => {
    const date = r.summary.latestReviewedOn;
    if (!date) return latest;
    return !latest || date > latest ? date : latest;
  }, null);

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-6 md:px-8">
      <section className="grid gap-8 py-8 md:grid-cols-[1fr_20rem] md:items-start md:gap-10 md:py-12">
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
        <dl className="border-l border-rule pl-6 font-sans text-[0.85rem] leading-relaxed text-muted">
          <dt className="label">Examination record</dt>
          <dd className="mb-2 text-ink refnum md:mb-3">
            {examined} of {totalFindings} findings
          </dd>
          <dt className="label">Latest examination</dt>
          <dd className="text-ink refnum">{formatDate(latestReview)}</dd>
          <dt className="label mt-3 hidden md:block">Standing</dt>
          <dd className="mt-1 hidden text-ink md:block">
            Provisional. Statuses are reported against sources; the record is
            not scored.
          </dd>
        </dl>
      </section>

      <section className="bleed bleed-strong pt-8">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h2 className="label">Trackers in the record</h2>
          <p className="refnum hidden text-[0.8rem] text-muted lg:block">
            {totalFindings} findings · {examined} examined
          </p>
        </div>
        <div
          aria-hidden="true"
          className="mt-4 hidden border-t border-rule-strong px-1 pt-2 lg:grid lg:grid-cols-[minmax(0,1fr)_4.5rem_4.5rem_5.5rem_6.5rem_6.5rem_1.5rem] lg:gap-x-5"
        >
          <span className="label">Tracker</span>
          <span className="label">Findings</span>
          <span className="label">Examined</span>
          <span className="label">Delivered</span>
          <span className="label whitespace-nowrap">In progress</span>
          <span className="label whitespace-nowrap">Not started</span>
        </div>
        <ul aria-label="Trackers in the record">
          {rows.map(({ party, summary }) => {
            const total = summary.total;
            const examined = summary.examined;
            const unexaminedCount = total - examined;
            const delivered = summary.counts.completed ?? 0;
            const inProgress = summary.counts.in_progress ?? 0;
            const notStarted = summary.counts.not_started ?? 0;
            const partial = summary.counts.partially_complete ?? 0;
            const cancelled = summary.counts.cancelled ?? 0;
            const allUnexamined = examined === 0;
            const label = allUnexamined
              ? `${party.name}, ${party.election}: ${total} findings, not examined yet.`
              : `${party.name}, ${party.election}: ${total} findings, ${examined} examined, ${unexaminedCount} not examined; ${delivered} delivered, ${partial} partially delivered, ${inProgress} in progress, ${notStarted} not started, ${cancelled} cancelled.`;

            return (
              <li key={party.id}>
                <Link
                  href={`/party/${party.slug}`}
                  aria-label={label}
                  className="ledger-row block border-t border-rule px-1 py-4 lg:py-5"
                >
                  <div className="grid grid-cols-3 items-baseline gap-x-3 gap-y-3 lg:grid-cols-[minmax(0,1fr)_4.5rem_4.5rem_5.5rem_6.5rem_6.5rem_1.5rem] lg:gap-x-5 lg:gap-y-4">
                    <div className="col-span-3 min-w-0 lg:col-span-1">
                      <h3 className="font-sans text-[1.35rem] font-semibold leading-tight">
                        {party.name}
                      </h3>
                      <p className="mt-1 text-[0.9rem] text-muted">
                        {party.election}
                      </p>
                      {allUnexamined && (
                        <p className="mt-2 font-sans text-[0.8rem] font-semibold tracking-[0.12em] text-muted uppercase">
                          Not examined yet
                        </p>
                      )}
                    </div>
                    <Count value={total} label="Findings" />
                    <Count value={allUnexamined ? "—" : examined} label="Examined" />
                    <Count value={allUnexamined ? "—" : delivered} label="Delivered" />
                    <Count value={allUnexamined ? "—" : inProgress} label="In progress" />
                    <Count value={allUnexamined ? "—" : notStarted} label="Not started" />
                    <span
                      aria-hidden="true"
                      className="justify-self-end self-center"
                    >
                      <ArrowRight />
                    </span>
                  </div>
                  {!allUnexamined && (
                    <Distribution
                      counts={summary.counts}
                      total={total}
                      unexamined={unexaminedCount}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section
        id="method"
        className="bleed mt-14 grid gap-6 pt-8 md:grid-cols-[14rem_minmax(0,1fr)]"
      >
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
            found, not that the promise was abandoned. The record is
            provisional: statuses are reviewed against evidence, not scored.
          </p>
        </div>
      </section>
    </main>
  );
}
