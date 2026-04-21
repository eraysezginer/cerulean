import Link from "next/link";
import { companies } from "@/data/companies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function healthColor(h: number) {
  if (h < 40) return "text-red font-semibold";
  if (h <= 70) return "text-amber font-semibold";
  return "text-green font-semibold";
}

export default function CompaniesPage() {
  return (
    <div className="p-8">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search companies…"
          className="max-w-xs border-border bg-bg"
        />
        <Button className="ml-auto bg-teal text-primary-foreground hover:bg-teal/90">
          + Add company
        </Button>
      </div>
      <h1 className="mb-1 text-page-title text-text-1">All companies</h1>
      <p className="mb-6 text-body text-text-2">
        Portfolio coverage and signal density
      </p>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[640px] text-left text-body">
          <thead>
            <tr className="border-b border-border bg-bg-2 text-[12px] uppercase tracking-wide text-text-3">
              <th className="p-3 font-medium">Company</th>
              <th className="p-3 font-medium">Health</th>
              <th className="p-3 font-medium">Flags</th>
              <th className="p-3 font-medium">Last update</th>
              <th className="p-3 font-medium">Cadence</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-b-0">
                <td className="p-3">
                  <Link
                    href={`/companies/${c.id}/flags`}
                    className="font-semibold text-teal hover:underline"
                  >
                    {c.name}
                  </Link>
                </td>
                <td className={cn("p-3 tabular-nums", healthColor(c.health))}>
                  {c.health}
                </td>
                <td
                  className={cn(
                    "p-3 tabular-nums",
                    c.flags > 3 ? "font-semibold text-red" : "text-text-2"
                  )}
                >
                  {c.flags}
                </td>
                <td className="p-3 text-text-2">{c.lastUpdate}</td>
                <td
                  className={cn(
                    "p-3",
                    c.cadence === "Silent"
                      ? "font-semibold text-red"
                      : "text-text-2"
                  )}
                >
                  {c.cadence}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
