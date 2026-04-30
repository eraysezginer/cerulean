import { notFound } from "next/navigation";
import { getCompanyById } from "@/data/companies";
import { flagPolarity } from "@/data/flag-types";
import { getFlagsForCompany } from "@/data/flags";
import { FlagGroups } from "@/components/cerulean/FlagGroups";

export default async function CompanyFlagsPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { polarity?: string };
}) {
  const company = await getCompanyById(params.id);
  if (!company) notFound();

  const flags = await getFlagsForCompany(company.id);
  const polarity =
    searchParams?.polarity === "positive" || searchParams?.polarity === "negative"
      ? searchParams.polarity
      : undefined;
  const negativeCount = flags.filter((f) => flagPolarity(f) === "negative").length;
  const positiveCount = flags.filter((f) => flagPolarity(f) === "positive").length;
  const visibleFlags = polarity
    ? flags.filter((f) => flagPolarity(f) === polarity)
    : flags;

  return (
    <div className="p-8">
      <div className="mb-6 rounded-lg border border-border bg-bg-2 p-4 border-l-[3px] border-l-border pl-4">
        <h1 className="text-card-title text-text-1">
          {company.name} — {company.series ?? "Private"} · Health:{" "}
          -/100 · {negativeCount} negative · {positiveCount} positive flag
          {flags.length === 1 ? "" : "s"} (from document analysis)
        </h1>
        {polarity ? (
          <p className="mt-1 text-[13px] capitalize text-text-2">
            Showing {polarity} flags only.
          </p>
        ) : null}
      </div>

      <FlagGroups
        flags={visibleFlags}
        polarity={polarity}
        emptyText="No flags yet. They appear here after you upload a document and run Generate flags and analysis on the company upload page."
      />
    </div>
  );
}
