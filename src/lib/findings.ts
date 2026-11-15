import type { PromiseRow } from "./supabase/data";

/**
 * Finding numbers read down the unfiltered register — category order, then the
 * order the query returned — so a status or tag filter never renumbers a row.
 */
export function numberingByPromise(
  promises: readonly Pick<PromiseRow, "id" | "category_id">[],
  categories: readonly { id: string; sort_order: number }[],
): Map<string, number> {
  const rank = new Map(categories.map((c) => [c.id, c.sort_order]));
  const ordered = [...promises].sort(
    (a, b) =>
      (a.category_id ? rank.get(a.category_id) ?? 999 : 999) -
      (b.category_id ? rank.get(b.category_id) ?? 999 : 999),
  );
  return new Map(ordered.map((p, i) => [p.id, i + 1]));
}
