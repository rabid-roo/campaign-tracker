import Link from "next/link";
import { getAllStatusCounts, getParties } from "@/lib/supabase/data";
import { STATUSES, STATUS_LABELS } from "@/lib/status";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [parties, statusCounts] = await Promise.all([
    getParties(),
    getAllStatusCounts(),
  ]);

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">
          Campaign Promise Tracker
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Itemized election promises and their delivery status, backed by
          evidence.
        </p>
      </header>

      <div className="mb-8 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
        <strong>BETA — in progress</strong> (updated October 21, 2026). All
        promises are still under review and categorization.
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {parties.map((party) => {
          const counts = statusCounts[party.id] ?? {};
          const total = Object.values(counts).reduce((a, b) => a + b, 0);
          return (
            <Link
              key={party.id}
              href={`/party/${party.slug}`}
              className="group rounded-xl border border-zinc-200 bg-white p-6 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
            >
              <h2 className="text-xl font-semibold group-hover:underline">
                {party.name}
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {party.election}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {STATUSES.map((status) => {
                  const n = counts[status] ?? 0;
                  if (n === 0) return null;
                  return (
                    <span
                      key={status}
                      className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      {STATUS_LABELS[status]}: {n}
                    </span>
                  );
                })}
              </div>

              <p className="mt-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {total} promises tracked
              </p>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
