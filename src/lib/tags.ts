export type Tag = { slug: string; label: string };

// Plan tags shown as badges + filter tabs on the party page.
// Add an entry here to introduce a new tag; the party page renders them automatically.
export const TAGS: Tag[] = [{ slug: "100-day-plan", label: "100-Day Plan" }];

export function tagSlug(label: string): string {
  return label.toLowerCase().replace(/\s+/g, "-");
}
