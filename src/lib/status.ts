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

/** Stamp variants, defined in globals.css. Status is never carried by colour alone. */
export const STATUS_STYLES: Record<Status, string> = {
  not_started: "stamp-none",
  in_progress: "stamp-progress",
  partially_complete: "stamp-partial",
  completed: "stamp-complete",
  cancelled: "stamp-cancelled",
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
