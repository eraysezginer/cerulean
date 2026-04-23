import { notFound } from "next/navigation";
import { getCompanyById } from "@/data/companies";
import { getFlagsForCompany } from "@/data/flags";
import { FlagCard } from "@/components/cerulean/FlagCard";
import { cn } from "@/lib/utils";

export default async function CompanyFlagsPage({
  params,
}: {
  params: { id: string };
}) {
  const company = await getCompanyById(params.id);
  if (!company) notFound();

  const flags = getFlagsForCompany(company.id);
  const health = company.health;

  return (
    <div className="p-8">
      <div
        className={cn(
          "mb-6 rounded-lg border border-border bg-bg-2 p-4 border-l-[3px] pl-4",
          health < 40 ? "border-l-red" : "border-l-amber"
        )}
      >
        <h1 className="text-card-title text-text-1">
          {company.name} — {company.series ?? "Private"} · Health:{" "}
          {health}/100 · {company.flags} active flags
        </h1>
      </div>

      <div className="space-y-4">
        {flags.map((f) => (
          <FlagCard key={f.id} flag={f} />
        ))}
      </div>
    </div>
  );
}
