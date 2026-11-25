import { ArrowUpRight } from "./arrows";

/**
 * One source affordance for the whole register: accent caps, ruled underline,
 * and the outbound mark inside the link's own box so truncation cannot clip it.
 */
export default function SourceLink({
  href,
  children,
  title,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={title ?? href}
      className={`inline-flex max-w-full min-w-0 min-h-11 items-center gap-1 font-sans text-[0.8rem] font-semibold tracking-[0.08em] text-accent uppercase underline decoration-accent/40 underline-offset-4 hover:decoration-accent ${className}`}
    >
      <span className="min-w-0 truncate">{children}</span>
      <ArrowUpRight />
    </a>
  );
}
