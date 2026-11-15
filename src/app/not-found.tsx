import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">
        Page not found
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        This address does not match anything on the tracker.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block py-0.5 text-sm font-medium text-blue-700 hover:underline dark:text-blue-400"
      >
        Back to the trackers
      </Link>
    </main>
  );
}
