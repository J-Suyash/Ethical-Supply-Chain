import Link from "next/link";
import { contractConfig } from "@/lib/contracts";

export function SiteNav() {
  const hasBase = Boolean(contractConfig.basePaperAddress);
  const hasProposed = Boolean(contractConfig.proposedAddress);

  return (
    <header className="rounded-[28px] border border-line bg-panel px-5 py-4 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">New Supply Chain</p>
          <p className="display-type text-2xl leading-none text-foreground">Base vs proposed demo</p>
        </div>

        <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
          <Link className="rounded-full border border-line bg-panel-strong px-4 py-2" href="/">
            Home
          </Link>
          <Link className="rounded-full border border-line bg-panel-strong px-4 py-2" href="/verify">
            Verify
          </Link>
        </nav>

        <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          <span className="rounded-full border border-line bg-panel-strong px-3 py-2">
            Base {hasBase ? "ready" : "missing"}
          </span>
          <span className="rounded-full border border-line bg-panel-strong px-3 py-2">
            Proposed {hasProposed ? "ready" : "missing"}
          </span>
        </div>
      </div>
    </header>
  );
}
