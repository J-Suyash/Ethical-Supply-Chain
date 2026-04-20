import type { Metadata } from "next";
import { SiteNav } from "@/components/shared/site-nav";
import { lifecycleStages, systemModules, metrics, features } from "@/lib/domain";

export const metadata: Metadata = {
  title: "Ethical Supply Chain",
  description:
    "Blockchain-powered ethical supply chain with threshold-based authority validation on Sepolia.",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-col">
        <SiteNav />

        <section className="border-b border-line px-6 py-16 md:py-24">
          <p className="font-data text-muted">BLOCKCHAIN-POWERED ETHICAL GOVERNANCE</p>
          <h1 className="font-display mt-4 text-6xl md:text-8xl lg:text-[120px]">
            ETHICAL
            <br />
            SUPPLY
            <br />
            CHAIN
          </h1>
          <p className="mt-8 max-w-xl text-lg text-muted">
            Multi-authority threshold validation on Sepolia. Every stage transition,
            approval, and rejection is permanently recorded on-chain.
          </p>
          <div className="mt-8 flex gap-3">
            <a
              href="/console"
              className="border border-line bg-foreground px-6 py-3 font-data text-background transition-colors hover:bg-accent"
            >
              OPEN CONSOLE
            </a>
            <a
              href="/verify"
              className="border border-line bg-panel px-6 py-3 font-data text-foreground transition-colors hover:bg-panel-alt"
            >
              VERIFY PRODUCT
            </a>
          </div>
        </section>

        <section className="border-b border-line">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {metrics.map((m) => (
              <div key={m.label} className="border-r border-line px-6 py-6 last:border-r-0">
                <p className="font-data text-muted">{m.label}</p>
                <p className="font-display mt-2 text-2xl">{m.value}</p>
                <p className="mt-1 text-sm text-muted">{m.hint}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-line px-6 py-12">
          <p className="font-data text-muted">SYSTEM MODULES</p>
          <h2 className="font-display mt-3 text-4xl md:text-5xl">ARCHITECTURE</h2>
          <div className="mt-8 grid gap-px border border-line bg-line md:grid-cols-2">
            {systemModules.map((mod) => (
              <div key={mod.name} className="bg-panel p-6">
                <h3 className="font-data text-foreground">{mod.name}</h3>
                <p className="mt-2 text-sm text-muted">{mod.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-line px-6 py-12">
          <p className="font-data text-muted">PRODUCT LIFECYCLE</p>
          <h2 className="font-display mt-3 text-4xl md:text-5xl">STAGES</h2>
          <div className="mt-8 grid gap-px border border-line bg-line md:grid-cols-5">
            {lifecycleStages.map((stage) => (
              <div key={stage.id} className="bg-panel p-5">
                <span className="font-display text-3xl text-line-muted">{stage.id}</span>
                <h3 className="font-data mt-3 text-foreground">{stage.name}</h3>
                <p className="mt-1 font-data text-accent">{stage.owner}</p>
                <p className="mt-2 text-sm text-muted">{stage.note}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-line px-6 py-12">
          <p className="font-data text-muted">KEY CAPABILITIES</p>
          <h2 className="font-display mt-3 text-4xl md:text-5xl">FEATURES</h2>
          <div className="mt-8 grid gap-px border border-line bg-line md:grid-cols-2">
            {features.map((f) => (
              <div key={f.title} className="bg-panel p-6">
                <h3 className="font-data text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm text-muted">{f.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="px-6 py-8">
          <div className="flex items-center justify-between">
            <span className="font-data text-muted">
              DEPLOYED ON SEPOLIA : CHAIN 11155111
            </span>
            <span className="font-data text-muted">ESC V1</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
