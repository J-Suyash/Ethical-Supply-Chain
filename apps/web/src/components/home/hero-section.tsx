import { metrics } from "@/lib/domain";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-line bg-panel px-6 py-8 shadow-[0_20px_80px_rgba(57,44,22,0.08)] backdrop-blur md:px-8 lg:px-10 lg:py-10">
      <div className="absolute inset-y-0 right-0 hidden w-80 bg-[radial-gradient(circle_at_center,_rgba(31,107,79,0.22),_transparent_70%)] lg:block" />
      <div className="relative grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            <span className="rounded-full border border-line bg-panel-strong px-3 py-2">Prototype console</span>
            <span className="rounded-full border border-line bg-panel-strong px-3 py-2">Bun workspace</span>
            <span className="rounded-full border border-line bg-panel-strong px-3 py-2">Next.js + Hardhat</span>
          </div>

          <div className="max-w-4xl space-y-4">
            <h1 className="display-type text-5xl leading-none tracking-tight text-balance text-foreground sm:text-6xl lg:text-7xl">
              Ethical supply chains need more than traceability. They need proof.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-muted sm:text-lg">
              This workspace turns the research plan into a buildable system: compact on-chain
              lifecycle state, threshold-based ethical approval, and off-chain evidence that can
              still be audited from a single product id.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <article
                key={metric.label}
                className="rounded-[24px] border border-line bg-panel-strong px-4 py-4"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
                  {metric.label}
                </p>
                <p className="mt-3 text-2xl font-semibold text-foreground">{metric.value}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{metric.hint}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="rounded-[28px] border border-[rgba(31,107,79,0.2)] bg-[#173b2f] p-6 text-[#f3ecdb] shadow-[0_18px_50px_rgba(21,46,37,0.22)]">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#cfe5d6]">
            Validation rule
          </p>
          <div className="mt-5 space-y-4">
            <p className="display-type text-4xl leading-none">2 approvals unlock onward movement.</p>
            <p className="text-sm leading-7 text-[#d7e5dc]">
              Authorities vote on a certificate digest. Once the threshold is reached, the product
              can move from manufacturing into active distribution.
            </p>
          </div>
          <div className="mt-8 space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
              <span>Approval path</span>
              <span className="font-semibold">Pending to Approved</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
              <span>Failure path</span>
              <span className="font-semibold">Pending to Rejected</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
              <span>Governance</span>
              <span className="font-semibold">Blacklist enforced</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
