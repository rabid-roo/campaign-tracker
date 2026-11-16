import { RegisterRows } from "@/components/register-skeleton";

/** The finding sheet before its record resolves: ruled placeholders, no spinner. */
export default function Loading() {
  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-6 md:px-8">
      <div className="border-b border-rule py-3">
        <div className="h-3 w-32 bg-rule/40" />
      </div>
      <div className="py-8 md:py-10">
        <div className="h-3 w-16 bg-rule/40" />
        <div className="mt-4 h-9 w-3/4 max-w-[33rem] bg-rule/30" />
        <div className="mt-6 h-3 w-1/2 max-w-[33rem] bg-rule/40" />
      </div>
      <RegisterRows rows={5} />
    </main>
  );
}
