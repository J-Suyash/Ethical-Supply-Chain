import { comparisonRows } from "@/lib/domain";

export function ComparisonSection() {
  return (
    <section className="rounded-[30px] border border-line bg-panel px-6 py-6 backdrop-blur">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">Base vs proposed</p>
          <h2 className="display-type mt-3 text-4xl leading-none">Panel-ready comparison</h2>
        </div>
        <p className="max-w-lg text-sm leading-6 text-muted">
          The workspace now separates the paper baseline from the research extension in both
          Solidity contracts and UI explanation.
        </p>
      </div>

      <div className="mt-8 overflow-hidden rounded-[24px] border border-line bg-panel-strong">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-line text-xs font-semibold uppercase tracking-[0.24em] text-muted">
              <th className="px-5 py-4">Feature</th>
              <th className="px-5 py-4">Base paper system</th>
              <th className="px-5 py-4">Proposed system</th>
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map((row) => (
              <tr key={row.feature} className="border-b border-line text-sm leading-6 text-foreground">
                <th scope="row" className="px-5 py-4 font-semibold">
                  {row.feature}
                </th>
                <td className="px-5 py-4 text-muted">{row.base}</td>
                <td className="px-5 py-4 text-muted">{row.proposed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
