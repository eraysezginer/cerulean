import { notFound } from "next/navigation";
import { getCompanyById } from "@/data/companies";
import { getFlagsForCompany } from "@/data/flags";
import { FlagCard } from "@/components/cerulean/FlagCard";

export default async function CompanyFlagsPage({
  params,
}: {
  params: { id: string };
}) {
  const company = await getCompanyById(params.id);
  if (!company) notFound();

  const flags = await getFlagsForCompany(company.id);

  return (
    <div className="p-8">
      <div className="mb-6 rounded-lg border border-border bg-bg-2 p-4 border-l-[3px] border-l-border pl-4">
        <h1 className="text-card-title text-text-1">
          {company.name} — {company.series ?? "Private"} · Health:{" "}
          -/100 · {flags.length} active flag{flags.length === 1 ? "" : "s"} (from document analysis)
        </h1>
      </div>

      <div className="space-y-4">
        {flags.length === 0 ? (
          <p className="text-body text-text-2">
            No flags yet. They appear here after you upload a document and run{" "}
            <strong>Generate flags and analysis</strong> on the company upload page.
          </p>
        ) : (
          flags.map((f) => <FlagCard key={f.id} flag={f} />)
        )}
      </div>
    </div>
  );
}
