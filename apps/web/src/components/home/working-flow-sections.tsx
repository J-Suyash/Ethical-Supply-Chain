import { basePaperFlow, proposedFlow } from "@/lib/domain";

export function WorkingFlowSections() {
  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <article className="rounded-[30px] border border-line bg-panel px-6 py-6 backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">Base paper working</p>
        <h2 className="display-type mt-3 text-4xl leading-none">How the original system works</h2>
        <div className="mt-8 grid gap-3">
          {basePaperFlow.map((step, index) => (
            <div
              key={step}
              className="flex items-start gap-4 rounded-[22px] border border-line bg-panel-strong px-4 py-4"
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#8a5a20]/20 bg-[#ead7b5] text-xs font-semibold text-[#8a5a20]">
                {index + 1}
              </div>
              <p className="text-sm leading-7 text-foreground">{step}</p>
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-[30px] border border-line bg-panel px-6 py-6 backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">Proposed working</p>
        <h2 className="display-type mt-3 text-4xl leading-none">How the research system extends it</h2>
        <div className="mt-8 grid gap-3">
          {proposedFlow.map((step, index) => (
            <div
              key={step}
              className="flex items-start gap-4 rounded-[22px] border border-line bg-panel-strong px-4 py-4"
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent/20 bg-accent-soft text-xs font-semibold text-accent">
                {index + 1}
              </div>
              <p className="text-sm leading-7 text-foreground">{step}</p>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
