"use client";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">
        This page could not load
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        The tracker data did not come back. Try again in a moment.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-6 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        Try again
      </button>
      {error.digest && (
        <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
          Reference: {error.digest}
        </p>
      )}
    </main>
  );
}
