import { STATUS_LABELS, STATUS_STYLES, type Status } from "@/lib/status";

export default function StatusBadge({ status }: { status: string }) {
  const s = status as Status;
  const style = STATUS_STYLES[s] ?? "bg-zinc-100 text-zinc-600";
  const label = STATUS_LABELS[s] ?? status;
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {label}
    </span>
  );
}
