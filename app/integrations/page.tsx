import { cn } from "@/lib/utils";

const items = [
  {
    name: "Visible.vc",
    status: "Connected",
    detail: "2h ago",
    border: "green" as const,
  },
  {
    name: "Email forwarding",
    status: "Connected",
    detail: "Active",
    border: "green" as const,
  },
  {
    name: "Carta Fund Admin",
    status: "Connected",
    detail: "4h ago",
    border: "green" as const,
  },
  {
    name: "Plaid (Open Banking)",
    status: "Partial",
    detail: "3 of 35 authorized",
    border: "amber" as const,
  },
  {
    name: "External signals",
    status: "Connected",
    detail: "Live",
    border: "green" as const,
  },
  {
    name: "Competitor intelligence",
    status: "Connected",
    detail: "Daily",
    border: "green" as const,
  },
];

export default function IntegrationsPage() {
  return (
    <div className="p-8">
      <h1 className="mb-6 text-page-title text-text-1">Connected sources</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((i) => (
          <div
            key={i.name}
            className={cn(
              "rounded-lg border border-border bg-bg-2 p-4 border-l-[3px]",
              i.border === "green" ? "border-l-green" : "border-l-amber"
            )}
          >
            <div className="text-card-title text-text-1">{i.name}</div>
            <div className="mt-1 text-body text-text-2">
              {i.status} · {i.detail}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
