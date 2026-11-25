export default function Loading() {
  return (
    <main
      id="main"
      aria-busy="true"
      aria-label="Loading the record"
      className="mx-auto w-full max-w-6xl px-6 md:px-8"
    >
      <section className="grid gap-10 py-12 md:grid-cols-[1fr_20rem] md:items-start md:py-12">
        <div>
          <div className="h-[3.6rem] w-4/5 bg-rule/40" />
          <div className="mt-3 h-[3.6rem] w-1/2 bg-rule/40" />
          <div className="mt-6 h-4 w-2/3 bg-rule/30" />
          <div className="mt-2 h-4 w-3/5 bg-rule/30" />
        </div>
        <div className="border-l border-rule pl-6">
          <div className="h-3 w-24 bg-rule/40" />
          <div className="mt-2 h-5 w-32 bg-rule/30" />
          <div className="mt-4 h-3 w-28 bg-rule/40" />
          <div className="mt-2 h-5 w-36 bg-rule/30" />
        </div>
      </section>
      <section className="bleed bleed-strong pt-8">
        <div className="h-3 w-36 bg-rule/40" />
        <ul className="mt-4" aria-hidden="true">
          {[0, 1].map((i) => (
            <li key={i} className="border-t border-rule py-5">
              <div className="h-6 w-2/5 bg-rule/50" />
              <div className="mt-2 h-3 w-1/4 bg-rule/30" />
              <div className="mt-4 h-4 w-3/4 bg-rule/30" />
              <div className="mt-3 h-1.5 w-full bg-rule/30" />
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
