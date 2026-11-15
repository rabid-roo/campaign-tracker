export default function TagBadge({ tag }: { tag: string }) {
  return (
    <span className="inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
      {tag}
    </span>
  );
}
