import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@/components/arrows";
import SourceLink from "@/components/source-link";
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

// The tracker's own deployment is an archived copy, not an independent source.
function sourceLabel(value: string): string {
  return /(^|\.)vercel\.app$/.test(hostOf(value)) ? "Archived copy" : hostOf(value);
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
    <main id="main" className="mx-auto w-full max-w-6xl px-6 md:px-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-rule py-3">
        <Link
          href={`/party/${party.slug}`}
          className="inline-flex min-h-11 items-center font-sans text-[0.8rem] font-semibold tracking-[0.14em] text-muted uppercase hover:text-ink"
        >
          <ArrowLeft className="mr-2" />
          {party.name}
        </Link>
        <p className="refnum text-[0.8rem] text-muted md:hidden">
          Finding {finding}
        </p>
      </div>

      <article>
        {/* Finding head */}
        <header className="grid gap-x-8 gap-y-5 py-8 md:grid-cols-[7rem_minmax(0,1fr)_minmax(11rem,max-content)] md:py-10">
          <aside className="hidden md:block">
            <p className="label">Finding</p>
            <p className="refnum mt-1 text-[1.05rem] text-ink">
              {finding}
            </p>
            {promise.tag && (
              <p className="mt-3 md:mt-4">
                <TagBadge tag={promise.tag} />
              </p>
            )}
            {promise.champion && (
              <p className="mt-3 md:mt-4">
                <span className="label block">Champion</span>
                <span className="mt-1 block text-[0.85rem]">
                  {promise.champion}
                </span>
              </p>
            )}
          </aside>

          <div className="min-w-0">
            <h1 className="max-w-[var(--measure)] text-balance break-words font-sans text-[clamp(1.75rem,3.2vw,2.35rem)] leading-[1.1] font-bold tracking-[-0.015em]">
              {promise.title}
            </h1>
            {promise.description && (
              <p className="reading mt-5 text-[1.0625rem] leading-relaxed text-ink/90">
                {promise.description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 md:block md:text-right">
            {reviewedOn ? (
              <>
                <p className="label md:mb-2">Status</p>
                <StatusBadge status={promise.current_status} size="lead" />
              </>
            ) : (
              <>
                <p className="label md:mb-2">Verdict</p>
                {/* No examination on file: print the absence, never a status. */}
                <p className="font-sans text-[0.95rem] font-semibold tracking-[0.13em] text-muted uppercase">
                  Not examined yet
                </p>
              </>
            )}
          </div>
        </header>

        {/* Ruled strip: sector, last examination, tally, and what the stamp claims */}
        <section className="bleed pt-4">
          <dl className="grid grid-cols-1 sm:grid-cols-4 sm:gap-y-4">
            <div className="flex min-w-0 flex-row items-baseline justify-between gap-3 border-b border-rule/50 py-2 sm:flex-col sm:items-start sm:gap-1 sm:border-0 sm:py-0 sm:px-1">
              <dt className="label order-2 sm:mt-1">Area</dt>
              <dd className="order-1 text-[0.95rem]">
                {category?.name ?? "Not categorized"}
              </dd>
            </div>
            <div className="flex min-w-0 flex-row items-baseline justify-between gap-3 border-b border-rule/50 py-2 sm:flex-col sm:items-start sm:gap-1 sm:border-0 sm:py-0 sm:px-1">
              <dt className="label order-2 sm:mt-1">Last examined</dt>
              <dd className="order-1 text-[0.95rem]">
                {reviewedOn ? (
                  <span className="refnum">{formatDate(reviewedOn)}</span>
                ) : (
                  "Not yet examined"
                )}
              </dd>
            </div>
            <div className="flex min-w-0 flex-row items-center justify-between gap-3 border-b border-rule/50 py-0 sm:flex-col sm:items-start sm:gap-1 sm:border-0 sm:py-0 sm:px-1">
              <dt className="label order-2 sm:mt-1">Source</dt>
              <dd className="order-1 min-w-0">
                {promise.source_url ? (
                  <SourceLink
                    href={promise.source_url}
                    className="sm:min-h-6"
                  >
                    {sourceLabel(promise.source_url)}
                  </SourceLink>
                ) : (
                  <p className="text-[0.95rem]">None recorded</p>
                )}
              </dd>
            </div>
            <div className="flex min-w-0 flex-row items-baseline justify-between gap-3 border-b border-rule/50 py-2 sm:flex-col sm:items-start sm:gap-1 sm:border-0 sm:py-0 sm:px-1">
              <dt className="label order-2 sm:mt-1">Targets met</dt>
              <dd className="order-1 text-[0.95rem]">
                {goals.length > 0 ? (
                  <span className="refnum">
                    {goalsMet} of {goals.length}
                  </span>
                ) : (
                  "None recorded"
                )}
              </dd>
            </div>
          </dl>
          <details className="mt-4 border-t border-rule pb-3">
            <summary
              aria-label={
                reviewedOn
                  ? `What “${statusLabel(promise.current_status)}” means`
                  : "How states are recorded"
              }
              className="flex min-h-11 cursor-pointer items-center py-2 font-sans text-[0.8rem] font-semibold tracking-[0.1em] uppercase"
            >
              {reviewedOn
                ? `What “${statusLabel(promise.current_status)}” means`
                : "How states are recorded"}
            </summary>
            <p className="border-b border-rule/50 pb-3 font-sans text-[0.8rem] text-muted">
              Each promise is one numbered finding in this register; the stamp
              is its delivery state.
            </p>
            <dl className="reading mt-3 space-y-2 text-[0.95rem]">
              {STATUSES.map((s) => (
                <div key={s} className="grid gap-1 sm:grid-cols-[9.5rem_1fr]">
                  <dt className="font-sans text-[0.8rem] font-semibold text-muted">
                    {STATUS_LABELS[s]}
                    {reviewedOn && s === promise.current_status && (
                      <span className="label ml-2 text-ink">Current</span>
                    )}
                  </dt>
                  <dd
                    className={
                      reviewedOn && s === promise.current_status
                        ? "text-ink"
                        : "text-muted"
                    }
                  >
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
            <figure className="mt-6 border-y border-rule py-5">
              <div className="reading">
                <blockquote className="text-[1.0625rem] leading-relaxed text-ink/90">
                  <p>“{promise.original_quote}”</p>
                </blockquote>
                <figcaption className="mt-2">
                  <span className="label">Stated in the platform</span>
                </figcaption>
              </div>
            </figure>
          )}

          {/* What the government did */}
          <section className="mt-12">
            <SectionLabel>What government did</SectionLabel>
            {updates.length === 0 ? (
              <p className="reading mt-3 border-t border-rule py-4 text-[0.95rem] text-muted">
                {reviewedOn
                  ? "Nothing on the record yet — no government action has been found for it."
                  : "Not examined yet — no check against council or provincial sources has been recorded for it."}
              </p>
            ) : (
              <ol className="mt-2">
                {updates.map((u) => (
                  <li key={u.id} className="border-t border-rule py-5">
                    <div className="grid gap-x-6 gap-y-2 md:grid-cols-[11rem_minmax(0,1fr)]">
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
                          <p className="reading text-[1.0625rem] leading-relaxed">
                            {u.summary}
                          </p>
                        )}
                        {!u.evidence_url && !u.evidence_source && (
                          <p className="label mt-2">No source recorded for this entry</p>
                        )}
                        {(u.evidence_url || u.evidence_source) && (
                          <p className="mt-2 text-[0.9rem] text-muted">
                            {u.evidence_source && (
                              <span>
                                {stripDatedSource(u.evidence_source, u.dated_on)}
                              </span>
                            )}
                            {u.evidence_url && (
                              <SourceLink
                                href={u.evidence_url}
                                className="ml-2 sm:min-h-6"
                              >
                                Open source
                              </SourceLink>
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
          {(goals.length > 0 || promise.metric) && (
            <section className="mt-12">
              <SectionLabel>Targets</SectionLabel>
              <ul className="reading mt-2">
                {promise.metric && (
                  <li className="border-t border-rule py-4">
                    <div className="min-w-0">
                      <p className="font-sans text-[1.05rem] font-medium">
                        Target
                      </p>
                      <p className="reading mt-1 text-[0.95rem] text-muted">
                        {promise.metric}
                        {promise.metric_source && (
                          <span> · {promise.metric_source}</span>
                        )}
                      </p>
                    </div>
                  </li>
                )}
                {goals.map((g) => (
                  <li
                    key={g.id}
                    className="grid gap-x-6 gap-y-2 border-t border-rule py-4 md:grid-cols-[minmax(0,1fr)_auto]"
                  >
                    <div className="min-w-0">
                      <p className="font-sans text-[1.05rem] font-medium">
                        {g.label}
                      </p>
                      {g.target && g.target !== g.label && (
                        <p className="reading mt-1 text-[0.95rem] text-muted">
                          {g.target}
                        </p>
                      )}
                      {(g.target_value != null || g.current_value != null) && (
                        <p className="refnum mt-2 text-[0.8rem] text-muted">
                          {g.target_value != null && (
                            <>
                              target {g.target_value}
                              {g.unit ? ` ${g.unit}` : ""}
                              {g.current_value != null ? " · " : ""}
                            </>
                          )}
                          {g.current_value != null && (
                            <>
                              recorded {g.current_value}
                              {g.unit ? ` ${g.unit}` : ""}
                            </>
                          )}
                        </p>
                      )}
                      {g.source_url && (
                        <div className="mt-2">
                          <SourceLink href={g.source_url}>Open source</SourceLink>
                        </div>
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
              <SectionLabel>Sources</SectionLabel>
              <ul className="mt-2">
                {references.map((r, i) => (
                  <li
                    key={r.id}
                    className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-4 gap-y-1 border-t border-rule py-3"
                  >
                    <span className="refnum text-[0.8rem] text-muted">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <p className="text-pretty text-[1.0625rem]">
                        <span className="font-medium">{r.label}</span>
                        {r.note && (
                          <span className="text-muted"> — {r.note}</span>
                        )}
                        {hasPageRef && r.page && (
                          <span className="refnum ml-2 text-[0.8rem] text-muted">
                            p. {r.page.replace(/^p\.?\s*/, "")}
                          </span>
                        )}
                      </p>
                      {r.url && (
                        <div className="mt-1 flex flex-wrap items-center gap-x-3">
                          <SourceLink href={r.url}>
                            Open source
                            <span className="sr-only"> for {r.label}</span>
                          </SourceLink>
                          {sourceLabel(r.url) === "Archived copy" && (
                            <span className="label">Archived copy</span>
                          )}
                        </div>
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
            <div>
              <h2 className="font-sans text-[0.9rem] font-semibold tracking-[0.02em]">
                Is this record accurate?
              </h2>
              <p className="label mt-1">
                Anonymous · one mark per visitor · tap it again to withdraw
              </p>
            </div>
            <VoteButtons promiseId={promise.id} initialScore={voteScore} />
          </div>
        </section>
      </article>
    </main>
  );
}
