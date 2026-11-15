import Link from "next/link";

export default function PartyNotFound() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">
        No tracker at this address
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        This party is either not published on the site or does not exist.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block text-sm font-medium text-blue-700 hover:underline dark:text-blue-400"
      >
        Back to the trackers
      </Link>
    </main>
  );
}
