/** Plan tag as a printed mark on the record, not a pill. */
export default function TagBadge({ tag }: { tag: string }) {
  return <span className="planmark">{tag}</span>;
}
