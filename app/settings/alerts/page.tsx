import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionLabel } from "@/components/cerulean/SectionLabel";

export default function AlertsSettingsPage() {
  return (
    <div className="p-8">
      <h1 className="mb-6 text-page-title text-text-1">Alerts & delivery</h1>

      <div className="mb-8 rounded-lg border border-border bg-bg-2 p-4">
        <SectionLabel className="mb-2">Weekly digest</SectionLabel>
        <p className="text-body text-text-2">
          Scheduled for Mondays 08:00 UTC — static mock.
        </p>
      </div>

      <SectionLabel className="mb-3">Webhook endpoints</SectionLabel>
      <div className="mb-8 space-y-2">
        {["https://hooks.example.com/a", "https://hooks.example.com/b", "https://hooks.example.com/c"].map(
          (u, i) => (
            <Input
              key={i}
              readOnly
              defaultValue={u}
              className="border-border bg-bg font-mono text-[13px]"
            />
          )
        )}
      </div>

      <div className="mb-8 rounded-lg border border-border bg-bg-2 p-4">
        <SectionLabel className="mb-2">Mobile alerts</SectionLabel>
        <p className="text-body text-text-2">
          Push delivery enabled for high-confidence flags only.
        </p>
      </div>

      <SectionLabel className="mb-3">Thresholds</SectionLabel>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-body text-text-2">
          <thead>
            <tr className="border-b border-border bg-bg-2 text-[12px] uppercase text-text-3">
              <th className="p-2 text-left">Signal class</th>
              <th className="p-2 text-left">Floor</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="p-2">Linguistic</td>
              <td className="p-2">High</td>
            </tr>
            <tr className="border-b border-border">
              <td className="p-2">External</td>
              <td className="p-2">Medium+</td>
            </tr>
            <tr>
              <td className="p-2">Cadence</td>
              <td className="p-2">Any</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Button type="button" className="mt-6 bg-teal text-primary-foreground">
        Save preferences
      </Button>
    </div>
  );
}
