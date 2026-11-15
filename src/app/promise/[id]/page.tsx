import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "@/components/arrows";
import StatusBadge from "@/components/status-badge";
import TagBadge from "@/components/tag-badge";
import VoteButtons from "@/components/vote-buttons";
import {
  getCategories,
  getGoals,
  getPromiseById,
  getPromisesByParty,
  getReferences,
  getVoteScore,
} from "@/lib/supabase/data";
import { numberingByPromise } from "@/lib/findings";
import {
  STATUSES,
  STATUS_LABELS,
  STATUS_MEANINGS,
  statusLabel,
} from "@/lib/status";

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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h2 className="label pt-4">{children}</h2>;
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
  const [voteScore, references, goals, partyPromises, categories] =
    await Promise.all([
      getVoteScore(id),
      getReferences(id),
      getGoals(id),
      getPromisesByParty(party.id),
      getCategories(),
    ]);
  // The same register numbering the party page prints, never a UUID slice.
  const finding = String(
    numberingByPromise(partyPromises, categories).get(id) ?? 0,
  ).padStart(3, "0");
  const reviewedOn = promise.reviewed_on ?? null;
  const goalsMet = goals.filter((g) => g.status === "completed").length;
  // The page column only earns its 48px when at least one reference cites a page.
  const hasPageRef = references.some((r) => r.page);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 md:px-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-rule py-3">
        <Link
          href={`/party/${party.slug}`}
          className="py-1 font-sans text-[0.8rem] font-semibold tracking-[0.14em] text-muted uppercase hover:text-ink"
        >
          <ArrowLeft className="mr-2" />
          {party.name}
        </Link>
        <p className="refnum text-[0.8rem] text-muted">Finding {finding}</p>
      </div>

      <article>
        {/* Finding head */}
        <header className="grid gap-x-8 gap-y-5 py-8 md:grid-cols-[7rem_minmax(0,1fr)_11rem] md:py-10">
          <aside className="flex flex-wrap items-baseline gap-x-4 gap-y-2 md:block">
            <p className="label hidden md:block">Finding</p>
            <p className="refnum mt-1 hidden text-[1.1rem] text-ink md:block">
              {finding}
            </p>
            {promise.tag && (
              <p className="mt-3 md:mt-4">
                <TagBadge tag={promise.tag} />
              </p>
            )}
          </aside>

          <div className="min-w-0">
            <h1 className="max-w-[24ch] text-balance break-words font-sans text-[clamp(1.75rem,3.2vw,2.35rem)] leading-[1.1] font-bold tracking-[-0.015em]">
              {promise.title}
            </h1>
            {promise.description && (
              <p className="reading mt-5 text-[1.0625rem] leading-relaxed text-ink/90">
                {promise.description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-start gap-3 md:block md:text-right">
            <StatusBadge status={promise.current_status} />
          </div>
        </header>

        {/* Ruled strip: sector, last examination, tally, and what the stamp claims */}
        <section className="bleed pt-4">
          <div className="grid grid-cols-2 gap-y-4 sm:grid-cols-3">
            <div className="px-1">
              <p className="text-[0.95rem]">{category?.name ?? "—"}</p>
              <p className="label mt-1">Sector</p>
            </div>
            <div className="px-1">
              <p className="refnum text-[0.95rem]">
                {formatDate(reviewedOn) || "—"}
              </p>
              <p className="label mt-1">Last examined</p>
            </div>
            <div className="px-1">
              <p className="refnum text-[0.95rem]">
                {goals.length > 0 ? `${goalsMet} of ${goals.length}` : "—"}
              </p>
              <p className="label mt-1">Measures met</p>
            </div>
          </div>
          <details className="mt-4 border-t border-rule pb-3">
            <summary className="cursor-pointer py-2 font-sans text-[0.8rem] font-semibold tracking-[0.1em] uppercase">
              What “{statusLabel(promise.current_status)}” means
            </summary>
            <dl className="reading mt-3 space-y-2 text-[0.95rem]">
              {STATUSES.map((s) => (
                <div key={s} className="grid gap-1 sm:grid-cols-[9.5rem_1fr]">
                  <dt className="font-sans text-[0.8rem] font-semibold text-muted">
                    {STATUS_LABELS[s]}
                  </dt>
                  <dd className={s === promise.current_status ? "text-ink" : "text-muted"}>
                    {STATUS_MEANINGS[s]}
                  </dd>
                </div>
              ))}
            </dl>
          </details>
        </section>

        {/* Reading column */}
        <div className="ml-0 md:ml-[9rem]">
          {promise.original_quote && (
            <figure className="reading mt-10 border-y border-rule py-5">
              <blockquote className="text-[1.0625rem] leading-relaxed text-ink/90">
                <p>“{promise.original_quote}”</p>
              </blockquote>
              <figcaption className="label mt-3">
                Stated in the platform
                {promise.source_url ? (
                  <>
                    {" · "}
                    <a
                      href={promise.source_url}
                      className="underline decoration-rule-strong underline-offset-2 hover:text-ink"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {hostOf(promise.source_url)}
                    </a>
                  </>
                ) : null}
              </figcaption>
            </figure>
          )}

          {/* Record of instruments */}
          <section className="mt-12">
            <SectionLabel>Record of instruments</SectionLabel>
            {updates.length === 0 ? (
              <p className="mt-3 border-t border-rule py-4 text-[0.95rem] text-muted">
                No instrument in the record yet — no government action has been
                found against this finding.
              </p>
            ) : (
              <ol className="mt-2">
                {updates.map((u) => (
                  <li key={u.id} className="border-t border-rule py-5">
                    <div className="grid gap-x-6 gap-y-2 md:grid-cols-[7.5rem_minmax(0,1fr)]">
                      <div>
                        <p className="refnum text-[0.8rem] text-muted">
                          <time dateTime={u.dated_on ?? u.created_at}>
                            {formatDate(u.dated_on) || formatDate(u.created_at)}
                          </time>
                        </p>
                        <div className="mt-2">
                          <StatusBadge status={u.status} size="small" />
                        </div>
                      </div>
                      <div className="min-w-0">
                        {u.summary && (
                          <p className="reading text-[1rem] leading-relaxed">
                            {u.summary}
                          </p>
                        )}
                        {(u.evidence_url || u.evidence_source) && (
                          <p className="mt-2 text-[0.9rem] text-muted">
                            {u.evidence_source && (
                              <span>
                                {stripDatedSource(u.evidence_source, u.dated_on)}
                              </span>
                            )}
                            {u.evidence_url && (
                              <a
                                href={u.evidence_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={u.evidence_url}
                                className="ml-2 inline-block whitespace-nowrap py-1 font-sans text-[0.8rem] font-semibold tracking-[0.08em] text-accent uppercase underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
                              >
                                Open source <ArrowUpRight className="ml-1" />
                              </a>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {/* Measures */}
          {goals.length > 0 && (
            <section className="mt-12">
              <SectionLabel>Measures</SectionLabel>
              <ul className="reading mt-2">
                {goals.map((g) => (
                  <li
                    key={g.id}
                    className="grid gap-x-6 gap-y-2 border-t border-rule py-4 md:grid-cols-[minmax(0,1fr)_auto]"
                  >
                    <div className="min-w-0">
                      <p className="font-sans text-[1rem] font-medium">
                        {g.label}
                      </p>
                      {g.target && g.target !== g.label && (
                        <p className="reading mt-1 text-[0.92rem] text-muted">
                          {g.target}
                        </p>
                      )}
                      {g.target_value != null && (
                        <p className="refnum mt-2 text-[0.78rem] text-muted">
                          target {g.target_value}
                          {g.current_value != null
                            ? ` · recorded ${g.current_value}`
                            : " · nothing recorded"}
                        </p>
                      )}
                    </div>
                    <div className="md:justify-self-end">
                      <StatusBadge status={g.status} size="small" />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Evidence register */}
          {references.length > 0 && (
            <section className="mt-12">
              <SectionLabel>Evidence register</SectionLabel>
              <ul className="mt-2">
                {references.map((r, i) => (
                  <li
                    key={r.id}
                    className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-4 gap-y-1 border-t border-rule py-3"
                  >
                    <span className="refnum text-[0.78rem] text-muted">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[0.98rem]">
                        <span className="font-medium">{r.label}</span>
                        {r.note && (
                          <span className="text-muted"> — {r.note}</span>
                        )}
                        {hasPageRef && r.page && (
                          <span className="refnum ml-2 text-[0.72rem] text-muted">
                            p. {r.page}
                          </span>
                        )}
                      </p>
                      {r.url && (
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={r.url}
                          className="mt-0.5 block truncate font-sans text-[0.78rem] leading-6 font-semibold tracking-[0.06em] text-accent uppercase underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
                        >
                          {hostOf(r.url)} <ArrowUpRight className="ml-1" />
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

        </div>
        {/* Reader assessment */}
        <section className="bleed mt-14">
          <div className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-sans text-[0.9rem] font-semibold tracking-[0.02em]">
              Does this record match the evidence?
            </p>
            <VoteButtons promiseId={promise.id} initialScore={voteScore} />
          </div>
        </section>
      </article>
    </main>
  );
}
