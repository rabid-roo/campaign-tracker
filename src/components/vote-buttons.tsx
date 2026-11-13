"use client";

import { useEffect, useRef, useState } from "react";

export default function VoteButtons({
  promiseId,
  initialScore,
}: {
  promiseId: string;
  initialScore: number;
}) {
  const [score, setScore] = useState(initialScore);
  const [myVote, setMyVote] = useState<0 | 1 | -1>(0);
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
    const voterId = voterIdRef.current;
    if (!voterId) return;
    const next: 0 | 1 | -1 = myVote === vote ? 0 : vote;
    const prev = myVote;
    setMyVote(next);
    setScore((s) => s - prev + next);

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
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error("vote failed");
      if (typeof d.score === "number") setScore(d.score);
      if (typeof d.myVote === "number") setMyVote(d.myVote);
    } catch {
      setMyVote(prev);
      setScore((s) => s + prev - next);
    }
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => cast(1)}
        aria-label="Mark as accurate"
        title="Accurate"
        className={`rounded px-2 py-1 text-lg leading-none transition-colors ${
          myVote === 1
            ? "bg-green-100 dark:bg-green-900/40"
            : "opacity-50 hover:opacity-100"
        }`}
      >
        👍
      </button>
      <span className="min-w-8 text-center text-sm font-medium tabular-nums">
        {score}
      </span>
      <button
        onClick={() => cast(-1)}
        aria-label="Mark as inaccurate"
        title="Inaccurate"
        className={`rounded px-2 py-1 text-lg leading-none transition-colors ${
          myVote === -1
            ? "bg-red-100 dark:bg-red-900/40"
            : "opacity-50 hover:opacity-100"
        }`}
      >
        👎
      </button>
    </div>
  );
}
