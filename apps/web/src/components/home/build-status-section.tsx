import { milestoneTasks } from "@/lib/domain";

export function BuildStatusSection() {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <article className="rounded-[30px] border border-line bg-panel px-6 py-6 backdrop-blur">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">
              Current build status
            </p>
            <h2 className="display-type mt-3 text-4xl leading-none">What ships first</h2>
          </div>
          <p className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-foreground">
            See `tasks.md` in the workspace root for the full roadmap.
          </p>
        </div>

        <div className="mt-8 grid gap-3">
          {milestoneTasks.map((task, index) => (
            <div
              key={task}
              className="flex items-start gap-4 rounded-[22px] border border-line bg-panel-strong px-4 py-4"
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent/20 bg-accent-soft text-xs font-semibold text-accent">
                {index + 1}
              </div>
              <p className="text-sm leading-7 text-foreground">{task}</p>
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-[30px] border border-line bg-panel-strong px-6 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">Stack alignment</p>
        <h2 className="display-type mt-3 text-4xl leading-none">Research to implementation</h2>
        <div className="mt-8 space-y-5 text-sm leading-7 text-muted">
          <p>
            <span className="font-semibold text-foreground">Blockchain:</span> Solidity contract
            pair for comparison: `BasePaperMedicineSupplyChain.sol` and `EthicalSupplyChain.sol`.
          </p>
          <p>
            <span className="font-semibold text-foreground">Frontend:</span> Next.js app for
            base-paper explanation, proposed workflow, and panel-ready comparison views.
          </p>
          <p>
            <span className="font-semibold text-foreground">Evidence:</span> certificate files
            stay off-chain while their digests anchor the review history on-chain.
          </p>
          <p>
            <span className="font-semibold text-foreground">Evaluation:</span> gas, storage,
            fraud-resistance, and governance behavior can now be tested directly from code.
          </p>
        </div>
      </article>
    </section>
  );
}
