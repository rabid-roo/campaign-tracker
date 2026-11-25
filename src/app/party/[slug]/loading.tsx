import { RegisterRows } from "@/components/register-skeleton";

export default function Loading() {
  return (
    <main
      id="main"
      aria-busy="true"
      aria-label="Loading the tracker"
      className="mx-auto w-full max-w-6xl px-6 md:px-8"
    >
      <div className="border-b border-rule py-3">
        <div className="h-4 w-28 bg-rule/40" />
      </div>
      <header className="grid gap-6 py-10 md:grid-cols-[minmax(0,1fr)_20rem] md:items-end">
        <div>
          <div className="h-10 w-3/4 bg-rule/50" />
          <div className="mt-3 h-4 w-1/3 bg-rule/30" />
        </div>
        <div className="h-16 w-full bg-rule/20" />
      </header>
      <div className="bleed py-6">
        <RegisterRows rows={8} />
      </div>
    </main>
  );
}
