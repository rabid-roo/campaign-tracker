"use client";

import { useEffect, useRef, useState } from "react";

const ICON = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

// Lucide thumbs-up / thumbs-down (ISC), 24x24 viewBox.
function ThumbIcon({ down = false }: { down?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px]" {...ICON}>
      {down ? (
        <>
          <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
          <path d="M17 14V2" />
        </>
      ) : (
        <>
          <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
          <path d="M7 10v12" />
        </>
      )}
    </svg>
  );
}

export default function VoteButtons({
  promiseId,
  initialScore,
}: {
  promiseId: string;
  initialScore: number;
}) {
  const [score, setScore] = useState(initialScore);
  const [myVote, setMyVote] = useState<0 | 1 | -1>(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const voterIdRef = useRef("");

  useEffect(() => {
    let id = localStorage.getItem("voter_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("voter_id", id);
    }
    voterIdRef.current = id;

    fetch(`/api/vote?promise_id=${promiseId}&voter_id=${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.score === "number") setScore(d.score);
        if (typeof d.myVote === "number") setMyVote(d.myVote);
      })
      .catch(() => {});
  }, [promiseId]);

  async function cast(vote: 1 | -1) {
    if (pending) return;
    const voterId = voterIdRef.current;
    if (!voterId) {
      setError("Couldn’t save your vote. Reload the page and try again.");
      return;
    }
    const next: 0 | 1 | -1 = myVote === vote ? 0 : vote;
    const prev = myVote;
    setError(null);
    setPending(true);
    setMyVote(next);
    setScore((s) => s - prev + next);

    let status = 0;
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promise_id: promiseId,
          voter_id: voterId,
          vote: next,
        }),
      });
      status = res.status;
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error("vote failed");
      if (typeof d.score === "number") setScore(d.score);
      if (typeof d.myVote === "number") setMyVote(d.myVote);
    } catch {
      setMyVote(prev);
      setScore((s) => s + prev - next);
      setError(
        status === 429
          ? "Too many votes in a short time. Try again in a few minutes."
          : "Couldn’t save your vote. Try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => cast(1)}
        disabled={pending}
        aria-label="Mark as accurate"
        aria-pressed={myVote === 1}
        title="Accurate"
        className={`flex h-11 w-11 items-center justify-center rounded transition-colors disabled:opacity-40 ${
          myVote === 1
            ? "bg-green-100 ring-2 ring-green-600 dark:bg-green-900/40 dark:ring-green-400"
            : "opacity-50 hover:opacity-100 focus-visible:opacity-100"
        }`}
      >
        <ThumbIcon />
      </button>
      <span
        aria-live="polite"
        className="min-w-8 text-center text-sm font-medium tabular-nums"
      >
        {score}
        <span className="sr-only">
          {Math.abs(score) === 1 ? " net vote" : " net votes"}
        </span>
      </span>
      <button
        type="button"
        onClick={() => cast(-1)}
        disabled={pending}
        aria-label="Mark as inaccurate"
        aria-pressed={myVote === -1}
        title="Inaccurate"
        className={`flex h-11 w-11 items-center justify-center rounded transition-colors disabled:opacity-40 ${
          myVote === -1
            ? "bg-red-100 ring-2 ring-red-600 dark:bg-red-900/40 dark:ring-red-400"
            : "opacity-50 hover:opacity-100 focus-visible:opacity-100"
        }`}
      >
        <ThumbIcon down />
      </button>
      </div>
      {error && (
        <p role="status" aria-live="polite" className="text-xs text-red-700 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
