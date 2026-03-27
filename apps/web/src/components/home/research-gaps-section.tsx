import { researchGaps } from "@/lib/domain";

export function ResearchGapsSection() {
  return (
    <section className="rounded-[30px] border border-line bg-panel px-6 py-6 backdrop-blur">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">Research gaps</p>
          <h2 className="display-type mt-3 text-4xl leading-none">What the base paper leaves open</h2>
        </div>
        <p className="max-w-lg text-sm leading-6 text-muted">
          The parsed paper gives us a strong traceability baseline, but the contract logic still
          leaves several gaps we can now demonstrate and test.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {researchGaps.map((gap) => (
          <article key={gap.title} className="rounded-[24px] border border-line bg-panel-strong p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">Gap</p>
            <h3 className="mt-3 text-2xl font-semibold text-foreground">{gap.title}</h3>
            <p className="mt-3 text-sm leading-6 text-muted">{gap.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
