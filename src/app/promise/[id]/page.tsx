import Link from "next/link";
import { notFound } from "next/navigation";
import StatusBadge from "@/components/status-badge";
import VoteButtons from "@/components/vote-buttons";
import {
  getPromiseById,
  getReferences,
  getVoteScore,
} from "@/lib/supabase/data";
import { statusLabel } from "@/lib/status";

export const dynamic = "force-dynamic";

function formatDate(value: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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
  const voteScore = await getVoteScore(id);
  const references = await getReferences(id);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <Link
        href={`/party/${party.slug}`}
        className="text-sm text-zinc-500 hover:underline dark:text-zinc-400"
      >
        &larr; {party.name}
      </Link>

      <article className="mt-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold leading-tight tracking-tight">
            {promise.title}
          </h1>
          <StatusBadge status={promise.current_status} />
        </div>

        {category && (
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {category.name}
          </p>
        )}

        {promise.metric && (
          <p className="mt-2 text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Target: </span>
            <span className="font-medium">{promise.metric}</span>
            {promise.metric_source && (
              <span className="text-zinc-400 dark:text-zinc-500">
                {" "}
                · {promise.metric_source}
              </span>
            )}
          </p>
        )}

        <div className="mt-4 flex items-center gap-3">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            Accurate?
          </span>
          <VoteButtons promiseId={promise.id} initialScore={voteScore} />
        </div>

        {promise.description && (
          <p className="mt-5 text-zinc-700 dark:text-zinc-300">
            {promise.description}
          </p>
        )}

        {promise.original_quote && (
          <blockquote className="mt-5 rounded-lg border-l-4 border-zinc-300 bg-zinc-50 p-4 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
            &ldquo;{promise.original_quote}&rdquo;
          </blockquote>
        )}

        {references.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 text-lg font-semibold">References</h2>
            <ul className="space-y-3">
              {references.map((r) => (
                <li key={r.id} className="flex items-start gap-2 text-sm">
                  {r.page && (
                    <span className="mt-0.5 shrink-0 rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {r.page}
                    </span>
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
                        className="block truncate text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {r.url}
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold">Status history</h2>
          {updates.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No status updates recorded yet.
            </p>
          ) : (
            <ol className="space-y-4 border-l-2 border-zinc-200 pl-5 dark:border-zinc-700">
              {updates.map((u) => (
                <li key={u.id} className="relative">
                  <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                  <div className="flex items-center gap-2">
                    <StatusBadge status={u.status} />
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      {statusLabel(u.status)}
                    </span>
                  </div>
                  {u.summary && (
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {u.summary}
                    </p>
                  )}
                  {(u.evidence_url || u.evidence_source) && (
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      {u.evidence_source && (
                        <span className="mr-2">{u.evidence_source}</span>
                      )}
                      {u.evidence_url && (
                        <a
                          href={u.evidence_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          Evidence
                        </a>
                      )}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                    {formatDate(u.dated_on) || formatDate(u.created_at)}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>
      </article>
    </main>
  );
}
