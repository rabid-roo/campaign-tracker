export const STATUSES = [
  "not_started",
  "in_progress",
  "partially_complete",
  "completed",
  "cancelled",
] as const;

export type Status = (typeof STATUSES)[number];

export const STATUS_LABELS: Record<Status, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  partially_complete: "Partially Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const STATUS_STYLES: Record<Status, string> = {
  not_started:
    "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200",
  in_progress:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  partially_complete:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  completed:
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

export const STATUS_MEANINGS: Record<Status, string> = {
  not_started: "No government action recorded yet.",
  in_progress:
    "Action has begun — a motion passed, staff were directed, or work started.",
  partially_complete: "Some of the promised work is in place; the rest is not.",
  completed: "Delivered as promised.",
  cancelled: "Abandoned or reversed.",
};

export function statusLabel(status: string): string {
  return STATUS_LABELS[status as Status] ?? status;
}
