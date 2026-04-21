import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/cerulean/SectionLabel";

const audit = [
  { id: "a1", actor: "user@firm.com", action: "Viewed evidence", hash: "sha256:91ab…c2" },
  { id: "a2", actor: "user@firm.com", action: "Exported LP report", hash: "sha256:44fe…01" },
  { id: "a3", actor: "system", action: "Sync Carta", hash: "sha256:bb02…7a" },
  { id: "a4", actor: "user@firm.com", action: "Note created", hash: "sha256:e4b2…9f" },
];

export default function CompliancePage() {
  return (
    <div className="p-8">
      <h1 className="mb-6 text-page-title text-text-1">Compliance & audit</h1>

      <SectionLabel className="mb-3">Audit log</SectionLabel>
      <div className="mb-8 overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[560px] text-left text-body">
          <thead>
            <tr className="border-b border-border bg-bg-2 text-[12px] uppercase text-text-3">
              <th className="p-2 font-medium">Actor</th>
              <th className="p-2 font-medium">Action</th>
              <th className="p-2 font-medium">Record hash</th>
            </tr>
          </thead>
          <tbody>
            {audit.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-b-0">
                <td className="p-2 text-text-2">{r.actor}</td>
                <td className="p-2 text-text-1">{r.action}</td>
                <td className="p-2 font-mono text-[12px] text-text-3">{r.hash}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SectionLabel className="mb-3">Redaction controls</SectionLabel>
      <div className="mb-8 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-body text-text-2">
          <thead>
            <tr className="border-b border-border bg-bg-2 text-[12px] uppercase text-text-3">
              <th className="p-2 text-left">Field</th>
              <th className="p-2 text-left">Policy</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="p-2">PII in notes</td>
              <td className="p-2">Masked at rest</td>
            </tr>
            <tr>
              <td className="p-2">Source hashes</td>
              <td className="p-2">Full retention</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-border bg-bg-2 p-4">
        <p className="mb-3 text-body text-text-2">
          Network effect disclosure: aggregate patterns may inform model
          calibration across tenants. You may opt out.
        </p>
        <Button type="button" variant="outline" size="sm">
          Opt out of aggregate calibration
        </Button>
      </div>
    </div>
  );
}
