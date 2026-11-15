import Link from "next/link";
import { notFound } from "next/navigation";
import StatusBadge from "@/components/status-badge";
import TagBadge from "@/components/tag-badge";
import VoteButtons from "@/components/vote-buttons";
import {
  getGoals,
  getPromiseById,
  getReferences,
  getVoteScore,
} from "@/lib/supabase/data";
import { STATUSES, STATUS_LABELS, STATUS_MEANINGS, statusLabel } from "@/lib/status";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getPromiseById(id);
  return {
    title: detail
      ? `${detail.promise.title} — ${detail.party.name}`
      : "Campaign Promise Tracker",
  };
}

function formatDate(value: string | null): string {
  if (!value) return "";
  const d = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(
        Number(value.slice(0, 4)),
        Number(value.slice(5, 7)) - 1,
        Number(value.slice(8, 10)),
      )
    : new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function hostOf(value: string): string {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}

// Each history entry prints its own date line, so drop a leading ISO date that
// only repeats it (e.g. "2026-11-06 Special Council Meeting").
function stripDatedSource(source: string, datedOn: string | null): string {
  if (!datedOn) return source;
  const prefix = `${datedOn} `;
  return source.startsWith(prefix) ? source.slice(prefix.length) : source;
}

export default async function PromisePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getPromiseById(id);
  if (!detail) notFound();

  const { promise, party, category, updates } = detail;
  const [voteScore, references, goals] = await Promise.all([
    getVoteScore(id),
    getReferences(id),
    getGoals(id),
  ]);
  // Newest first: dated_on desc, then created_at desc (see getPromiseById).
  const lastChange = updates[0]?.dated_on ?? updates[0]?.created_at ?? null;
  const reviewedOn = promise.reviewed_on ?? null;
  const goalsMet = goals.filter((g) => g.status === "completed").length;
  // The page column only earns its 48px when at least one reference cites a page.
  const hasPageRef = references.some((r) => r.page);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <Link
        href={`/party/${party.slug}`}
        className="text-sm text-zinc-500 hover:underline dark:text-zinc-400"
      >
        &larr; {party.name}
      </Link>

      <article className="mt-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
          <h1 className="min-w-0 text-balance break-words text-xl font-semibold leading-tight tracking-tight md:text-2xl">
            {promise.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2 md:shrink-0">
            {promise.tag && <TagBadge tag={promise.tag} />}
            <StatusBadge status={promise.current_status} />
          </div>
        </div>

        {category && (
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {category.name}
          </p>
        )}

        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {reviewedOn ? (
            <>
              Last reviewed{" "}
              <time className="whitespace-nowrap" dateTime={reviewedOn}>
                {formatDate(reviewedOn)}
              </time>
            </>
          ) : lastChange ? (
            <>
              Latest status update{" "}
              <time className="whitespace-nowrap" dateTime={lastChange}>
                {formatDate(lastChange)}
              </time>
            </>
          ) : (
            "No review recorded yet"
          )}
          {goals.length > 0 && (
            <span className="whitespace-nowrap">
              {" · "}
              {goalsMet} of {goals.length} {goals.length === 1 ? "goal" : "goals"}{" "}
              met
            </span>
          )}
        </p>

        <details className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          <summary className="cursor-pointer select-none hover:text-zinc-900 dark:hover:text-zinc-200">
            What “{statusLabel(promise.current_status)}” means
          </summary>
          <dl className="mt-2 space-y-1.5">
            {STATUSES.map((s) => (
              <div key={s}>
                <dt className="inline font-medium text-zinc-700 dark:text-zinc-300">
                  {STATUS_LABELS[s]}
                </dt>
                <dd className="inline"> — {STATUS_MEANINGS[s]}</dd>
              </div>
            ))}
          </dl>
        </details>

        {promise.metric && (
          <p className="mt-2 text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Target: </span>
            <span className="font-medium">{promise.metric}</span>
            {promise.metric_source && (
              <span className="text-zinc-600 dark:text-zinc-400">
                {" "}
                · {promise.metric_source}
              </span>
            )}
          </p>
        )}

        {promise.description && (
          <p className="mt-5 max-w-[var(--measure)] text-pretty text-zinc-700 dark:text-zinc-300">
            {promise.description}
          </p>
        )}

        {promise.original_quote && (
          <blockquote className="mt-4 max-w-[var(--measure)] rounded-lg border-l-4 border-zinc-300 bg-white p-4 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
            &ldquo;{promise.original_quote}&rdquo;
          </blockquote>
        )}

        {goals.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-3 font-mono text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Goals</h2>
            <ul className="space-y-2">
              {goals.map((g) => (
                <li
                  key={g.id}
                  className="rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{g.label}</span>
                    <StatusBadge status={g.status} />
                  </div>
                  {g.target && g.target !== g.label && (
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">
                      {g.target}
                    </div>
                  )}
                  {(g.target_value != null || g.current_value != null) && (
                    <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      {g.target_value != null && (
                        <span className="mr-4">
                          Target: {g.target_value}
                          {g.unit ? ` ${g.unit}` : ""}
                        </span>
                      )}
                      {g.current_value != null && (
                        <span>
                          Current: {g.current_value}
                          {g.unit ? ` ${g.unit}` : ""}
                        </span>
                      )}
                    </div>
                  )}
                  {g.source_url && (
                    <a
                      href={g.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={g.source_url}
                      className="mt-1 block truncate text-sm text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {hostOf(g.source_url)}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-10">
          <h2 className="mb-4 font-mono text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Status history</h2>
          {updates.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No status changes recorded yet.
            </p>
          ) : (
            <ol className="space-y-4 border-l-2 border-zinc-400 pl-5 dark:border-zinc-600">
              {updates.map((u) => (
                <li key={u.id} className="relative">
                  <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-zinc-500 dark:bg-zinc-400" />
                  <div className="flex items-center gap-2">
                    <StatusBadge status={u.status} />
                  </div>
                  {u.summary && (
                    <p className="mt-1 max-w-[var(--measure)] text-pretty break-words text-sm text-zinc-600 dark:text-zinc-400">
                      {u.summary}
                    </p>
                  )}
                  {(u.evidence_url || u.evidence_source) && (
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      {u.evidence_source && (
                        <span className="mr-2">
                          {stripDatedSource(u.evidence_source, u.dated_on)}
                        </span>
                      )}
                      {u.evidence_url && (
                        <a
                          href={u.evidence_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`View source: ${
                            u.evidence_source ?? "cited record"
                          }`}
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          View source
                        </a>
                      )}
                    </p>
                  )}
                  <p className="mt-1 font-mono text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                    {formatDate(u.dated_on) || formatDate(u.created_at)}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>

        {references.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 font-mono text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">References</h2>
            <ul className="space-y-3">
              {references.map((r) => (
                <li key={r.id} className="flex items-start gap-2 text-sm">
                  {hasPageRef && (
                    <div className="mt-0.5 min-w-12 shrink-0">
                      {r.page && (
                        <span className="inline-block whitespace-nowrap rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                          {r.page}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="min-w-0">
                    <span className="font-medium">{r.label}</span>
                    {r.note && (
                      <span className="text-zinc-500 dark:text-zinc-400">
                        {" "}
                        — {r.note}
                      </span>
                    )}
                    {r.url && (
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={r.url}
                        className="block truncate text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {hostOf(r.url)}
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-10 flex flex-col items-start gap-2 border-t border-zinc-200 pt-6 sm:flex-row sm:items-center sm:gap-3 dark:border-zinc-800">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            Does the evidence support “{statusLabel(promise.current_status)}”?
          </span>
          <VoteButtons promiseId={promise.id} initialScore={voteScore} />
        </div>
      </article>
    </main>
  );
}
