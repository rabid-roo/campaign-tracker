import {
  STATUS_LABELS,
  STATUS_STYLES,
  type Status,
} from "@/lib/status";

/** Status as printed apparatus: an outlined stamp, never a coloured pill. */
export default function StatusBadge({
  status,
  size = "default",
}: {
  status: string;
  size?: "default" | "small";
}) {
  const s = status as Status;
  const variant = STATUS_STYLES[s] ?? "stamp-none";
  const label = STATUS_LABELS[s] ?? status;
  return (
    <span
      className={`stamp ${variant} ${size === "small" ? "text-[0.625rem] px-1.5 py-1" : ""}`}
      data-status={s}
    >
      {label}
    </span>
  );
}
