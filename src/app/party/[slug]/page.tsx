import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@/components/arrows";
import StatusBadge from "@/components/status-badge";
import TagBadge from "@/components/tag-badge";
import {
  getCategories,
  getPartyBySlug,
  getPromisesByParty,
  getStatusCountsByParty,
} from "@/lib/supabase/data";
import { numberingByPromise } from "@/lib/findings";
import type { Party } from "@/lib/supabase/data";
import { RegisterRows } from "@/components/register-skeleton";
import { STATUSES, STATUS_LABELS } from "@/lib/status";
import { TAGS } from "@/lib/tags";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const party = await getPartyBySlug(slug);
  return { title: party ? `${party.name} — Promise Tracker` : "Campaign Promise Tracker" };
}

export default async function PartyPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ status?: string; tag?: string }>;
}) {
  const { slug } = await params;
  const { status, tag } = await searchParams;

  // Resolve the tracker before any streamed boundary so a hidden or missing one
  // answers with a real 404 instead of a 200 carrying a not-found body.
  const party = await getPartyBySlug(slug);
  if (!party) notFound();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-6 md:px-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-rule py-3">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center font-sans text-[0.8rem] font-semibold tracking-[0.14em] text-muted uppercase hover:text-ink"
        >
          <ArrowLeft className="mr-2" />
          All trackers
        </Link>
        <p className="text-[0.85rem] text-muted">
          examination {party.election}
        </p>
      </div>

      <header className="grid gap-6 py-10 md:grid-cols-[minmax(0,1fr)_20rem] md:items-end">
        <div>
          <h1 className="max-w-[22ch] font-sans text-[clamp(2rem,4.4vw,3rem)] leading-[1.05] font-bold tracking-[-0.02em]">
            {party.name}
          </h1>
          <p className="mt-3 text-[0.85rem] text-muted">{party.election}</p>
        </div>
        {party.description && (
          <p className="reading text-[0.95rem] leading-relaxed text-muted md:max-w-none">
            {party.description}
          </p>
        )}
      </header>

      <Suspense
        fallback={
          <div aria-busy="true" className="bleed py-6">
            <RegisterRows rows={8} />
          </div>
        }
      >
        <PartyRegister party={party} status={status} tag={tag} />
      </Suspense>
    </main>
  );
}

async function PartyRegister({
  party,
  status,
  tag,
}: {
  party: Party;
  status?: string;
  tag?: string;
}) {
  const [categories, promises, counts] = await Promise.all([
    getCategories(),
    getPromisesByParty(party.id),
    getStatusCountsByParty(party.id),
  ]);

  const activeTag = TAGS.find((t) => t.slug === tag);
  const filtered = (() => {
    if (activeTag) return promises.filter((p) => p.tag === activeTag.label);
    if (status && (STATUSES as readonly string[]).includes(status))
      return promises.filter((p) => p.current_status === status);
    return promises;
  })();

  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const numbers = numberingByPromise(promises, categories);
  const groups = new Map<string, typeof promises>();
  for (const p of filtered) {
    const key = p.category_id ?? "__none__";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  }

  const ordered = [...groups.entries()].sort(([a], [b]) => {
    const ca = a === "__none__" ? null : categoryMap.get(a);
    const cb = b === "__none__" ? null : categoryMap.get(b);
    return (ca?.sort_order ?? 999) - (cb?.sort_order ?? 999);
  });

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const active = Boolean(status || activeTag);

  return (
    <>
      {/* Count strip: the legend is printed before any status mark is shown. */}
      <section aria-label="Filter by status" className="bleed bleed-strong grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
        <Link
          href={`/party/${party.slug}`}
          aria-current={!active ? "page" : undefined}
          className={`border-t-2 px-1 pt-3 pb-4 ${
            !active ? "border-ink" : "border-transparent hover:border-rule-strong"
          }`}
        >
          <span className="refnum block text-[1.35rem] leading-none">{total}</span>
          <span className="label mt-2 block">All findings</span>
        </Link>
        {STATUSES.map((s) => {
          const n = counts[s] ?? 0;
          const isActive = status === s;
          return (
            <Link
              key={s}
              href={`/party/${party.slug}?status=${s}`}
              aria-current={isActive ? "page" : undefined}
              className={`border-t-2 px-1 pt-3 pb-4 ${
                isActive ? "border-ink" : "border-transparent hover:border-rule-strong"
              }`}
            >
              <span className="refnum block text-[1.35rem] leading-none">{n}</span>
              <span className="label mt-2 block">{STATUS_LABELS[s]}</span>
            </Link>
          );
        })}
      </section>

      <div className="flex flex-wrap items-baseline justify-between gap-3 py-4">
        <p className="label">
          Showing {filtered.length}{" "}
          {filtered.length === 1 ? "finding" : "findings"}
          {activeTag ? ` · ${activeTag.label}` : ""}
        </p>
        <div className="flex flex-wrap gap-4">
          {TAGS.map((t) => {
            const n = promises.filter((p) => p.tag === t.label).length;
            if (n === 0) return null;
            const isActive = tag === t.slug;
            return (
              <Link
                key={t.slug}
                href={`/party/${party.slug}?tag=${t.slug}`}
                aria-current={isActive ? "page" : undefined}
                className={`planmark ${isActive ? "border-ink text-ink" : ""}`}
              >
                {t.label} ({n})
              </Link>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 && (
        <section className="bleed pt-6">
          <p className="border-t border-rule pt-4 text-[0.95rem] text-muted">
            No finding in this record carries that mark.{" "}
            {active && (
              <Link
                href={`/party/${party.slug}`}
                className="inline-block py-1 font-sans text-[0.8rem] font-semibold tracking-[0.08em] text-accent uppercase underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
              >
                Show all {total} findings
              </Link>
            )}
          </p>
        </section>
      )}

      {ordered.map(([catId, items]) => {
        const cat = catId === "__none__" ? null : categoryMap.get(catId);
        return (
          <section key={catId} className="bleed pt-6">
            <h2 className="label pt-4">{cat?.name ?? "Uncategorized"}</h2>
            <ul>
              {items.map((p) => {
                const number = numbers.get(p.id) ?? 0;
                return (
                  <li key={p.id}>
                    <Link
                      href={`/promise/${p.id}`}
                      className="ledger-row grid grid-cols-[3rem_minmax(0,1fr)] items-baseline gap-x-4 gap-y-1 border-t border-rule py-4 md:grid-cols-[4rem_minmax(0,1fr)_auto]"
                    >
                      <span className="refnum text-[0.8rem] text-muted">
                        {String(number).padStart(3, "0")}
                      </span>
                      <span className="min-w-0 font-sans text-[1.05rem] leading-snug font-medium">
                        {p.title}
                        {p.tag && (
                          <span className="ml-3 inline-block align-baseline">
                            <TagBadge tag={p.tag} />
                          </span>
                        )}
                      </span>
                      <span className="col-start-2 md:col-start-auto md:justify-self-end">
                        <StatusBadge status={p.current_status} size="small" />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </>
  );
}
