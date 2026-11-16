/** The sheet before the register arrives: ruled rows, no spinner, no shimmer. */
export function RegisterRows({ rows = 6 }: { rows?: number }) {
  return (
    <ul className="border-t border-rule" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <li
          key={i}
          className="grid grid-cols-[3rem_minmax(0,1fr)] gap-x-4 border-b border-rule py-4"
        >
          <div className="h-3 w-8 bg-rule/40" />
          <div className="h-4 w-2/3 bg-rule/50" />
        </li>
      ))}
    </ul>
  );
}
