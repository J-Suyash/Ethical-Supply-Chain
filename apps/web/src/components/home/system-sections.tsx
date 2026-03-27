import { basePaperModules, lifecycleStages, systemModules } from "@/lib/domain";

export function SystemSections() {
  return (
    <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <article className="rounded-[30px] border border-line bg-[#f2e8d7] px-6 py-6 backdrop-blur">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">
              Base paper system
            </p>
            <h2 className="display-type mt-3 text-4xl leading-none">UPC blockchain flow</h2>
          </div>
          <p className="max-w-xs text-right text-sm leading-6 text-muted">
            Mirrors the core paper focus: consumer onboarding, UPC tracking, and sale-to-consume
            product flow.
          </p>
        </div>

        <div className="mt-8 grid gap-4">
          {basePaperModules.map((module, index) => (
            <article
              key={module.name}
              className="grid gap-3 rounded-[24px] border border-line bg-[rgba(255,251,243,0.82)] p-4 md:grid-cols-[auto_1fr]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ead7b5] text-sm font-semibold text-[#8a5a20]">
                B{index + 1}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{module.name}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{module.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </article>

      <article className="rounded-[30px] border border-line bg-panel px-6 py-6 backdrop-blur">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">
              Proposed system
            </p>
            <h2 className="display-type mt-3 text-4xl leading-none">Implementation spine</h2>
          </div>
          <p className="max-w-xs text-right text-sm leading-6 text-muted">
            Each module maps directly to a contract or application concern in the first build.
          </p>
        </div>

        <div className="mt-8 grid gap-4">
          {systemModules.map((module, index) => (
            <article
              key={module.name}
              className="grid gap-3 rounded-[24px] border border-line bg-panel-strong p-4 md:grid-cols-[auto_1fr]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-sm font-semibold text-accent">
                0{index + 1}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{module.name}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{module.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </article>

      <article className="rounded-[30px] border border-line bg-panel px-6 py-6 backdrop-blur lg:col-span-2">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">Lifecycle + gate</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <h2 className="display-type text-4xl leading-none">Five-stage product trace</h2>
          <p className="max-w-sm text-sm leading-6 text-muted">
            The first implementation couples product movement to ethical approval after
            manufacturing, making the trust assumption explicit and testable.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {lifecycleStages.map((stage) => (
            <article key={stage.id} className="rounded-[24px] border border-line bg-panel-strong p-5">
              <div className="flex items-center justify-between text-sm text-muted">
                <span>{stage.id}</span>
                <span>{stage.owner}</span>
              </div>
              <h3 className="mt-4 text-2xl font-semibold text-foreground">{stage.name}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{stage.note}</p>
            </article>
          ))}
        </div>
      </article>
    </section>
  );
}
