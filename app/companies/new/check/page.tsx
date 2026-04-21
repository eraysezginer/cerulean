import { SectionLabel } from "@/components/cerulean/SectionLabel";

export default function PreInvestmentCheckPage() {
  return (
    <div className="p-8">
      <div className="mb-8 rounded-lg border border-border bg-bg-2 p-4">
        <h1 className="text-card-title text-text-1">
          Luminary AI Inc. — Pre-seed
        </h1>
        <p className="text-body text-text-2">Scanning profile — static mock</p>
      </div>

      <SectionLabel className="mb-3">Founder history</SectionLabel>
      <div className="mb-8 space-y-2">
        <div className="rounded-lg border border-border border-l-[3px] border-l-green bg-bg-2 p-3">
          <span className="text-card-title text-text-1">M. Reeves</span>{" "}
          <span className="rounded bg-green-light px-2 py-0.5 text-[12px] font-medium text-green">
            Clear
          </span>
        </div>
        <div className="rounded-lg border border-border border-l-[3px] border-l-amber bg-bg-2 p-3">
          <span className="text-card-title text-text-1">S. Patel</span>{" "}
          <span className="rounded bg-amber-light px-2 py-0.5 text-[12px] font-medium text-amber">
            Flag
          </span>
          <span className="text-body text-text-2"> — prior litigation on record</span>
        </div>
      </div>

      <SectionLabel className="mb-3">Public signal scan</SectionLabel>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-body text-text-2">
          <thead>
            <tr className="border-b border-border bg-bg-2 text-[12px] uppercase text-text-3">
              <th className="p-2 text-left">Source</th>
              <th className="p-2 text-left">Result</th>
              <th className="p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {["EDGAR", "LinkedIn", "GitHub", "News"].map((s) => (
              <tr key={s} className="border-b border-border last:border-b-0">
                <td className="p-2">{s}</td>
                <td className="p-2">No adverse items in mock corpus</td>
                <td className="p-2">
                  <span className="rounded bg-green-light px-2 py-0.5 text-[12px] text-green">
                    Clear
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
