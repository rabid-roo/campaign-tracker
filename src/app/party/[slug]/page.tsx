import Link from "next/link";
import { notFound } from "next/navigation";
import StatusBadge from "@/components/status-badge";
import TagBadge from "@/components/tag-badge";
import {
  getCategories,
  getPartyBySlug,
  getPromisesByParty,
  getStatusCountsByParty,
} from "@/lib/supabase/data";
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

  const party = await getPartyBySlug(slug);
  if (!party) notFound();

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

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <Link
        href="/"
        className="py-1 text-sm text-zinc-500 hover:underline dark:text-zinc-400"
      >
        &larr; All trackers
      </Link>

      <header className="mt-4 mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">{party.name}</h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">{party.election}</p>
        {party.description && (
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            {party.description}
          </p>
        )}
      </header>

      <nav className="mb-8 flex flex-wrap items-center gap-2">
        <Link
          href={`/party/${party.slug}`}
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            !status && !activeTag
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          }`}
        >
          All ({total})
        </Link>
        {TAGS.map((t) => {
          const n = promises.filter((p) => p.tag === t.label).length;
          if (n === 0) return null;
          return (
            <Link
              key={t.slug}
              href={`/party/${party.slug}?tag=${t.slug}`}
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                tag === t.slug
                  ? "bg-purple-600 text-white dark:bg-purple-500"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {t.label} ({n})
            </Link>
          );
        })}
        {STATUSES.map((s) => {
          const n = counts[s] ?? 0;
          if (n === 0) return null;
          return (
            <Link
              key={s}
              href={`/party/${party.slug}?status=${s}`}
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                status === s
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {STATUS_LABELS[s]} ({n})
            </Link>
          );
        })}
      </nav>

      <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        Showing {filtered.length} promise{filtered.length === 1 ? "" : "s"}
      </p>

      {ordered.map(([catId, items]) => {
        const cat = catId === "__none__" ? null : categoryMap.get(catId);
        return (
          <section key={catId} className="mb-10">
            <h2 className="mb-3 font-mono text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {cat?.name ?? "Uncategorized"}
            </h2>
            <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
              {items.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/promise/${p.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="font-medium">{p.title}</span>
                      {p.tag && <TagBadge tag={p.tag} />}
                    </span>
                    <StatusBadge status={p.current_status} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </main>
  );
}
