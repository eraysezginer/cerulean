import { notFound } from "next/navigation";
import { getCompanyById } from "@/data/companies";
import { flagPolarity } from "@/data/flag-types";
import { getFlagsForCompany } from "@/data/flags";
import { FlagGroups } from "@/components/cerulean/FlagGroups";
import { SortDirectionSelect } from "@/components/cerulean/SortDirectionSelect";
import { SortBySelect } from "@/components/cerulean/SortBySelect";
import { computeHealthScoreV1FromFlags } from "@/lib/health-score-v1";

type CompanyFlagSort = "severity" | "confidence" | "signal";

const confidenceRank = { High: 0, Medium: 1, Low: 2 } as const;

function sortCompanyFlags(
  rows: Awaited<ReturnType<typeof getFlagsForCompany>>,
  sort: CompanyFlagSort,
  dir: "asc" | "desc"
) {
  const out = [...rows];
  const mult = dir === "asc" ? 1 : -1;
  out.sort((a, b) => {
    if (sort === "confidence") {
      const cmp =
        confidenceRank[a.confidence] - confidenceRank[b.confidence] ||
        a.signalType.localeCompare(b.signalType);
      return cmp * mult;
    }
    if (sort === "signal") {
      const cmp =
        a.signalType.localeCompare(b.signalType) ||
        confidenceRank[a.confidence] - confidenceRank[b.confidence];
      return cmp * mult;
    }
    const cmp =
      (flagPolarity(a) === "negative" ? 0 : 1) - (flagPolarity(b) === "negative" ? 0 : 1) ||
      confidenceRank[a.confidence] - confidenceRank[b.confidence] ||
      a.signalType.localeCompare(b.signalType);
    return cmp * mult;
  });
  return out;
}

export default async function CompanyFlagsPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { polarity?: string; sort?: string; dir?: string };
}) {
  const company = await getCompanyById(params.id);
  if (!company) notFound();

  const flags = await getFlagsForCompany(company.id);
  const polarity =
    searchParams?.polarity === "positive" || searchParams?.polarity === "negative"
      ? searchParams.polarity
      : undefined;
  const sort: CompanyFlagSort =
    searchParams?.sort === "confidence" ||
    searchParams?.sort === "signal"
      ? searchParams.sort
      : "severity";
  const dir: "asc" | "desc" = searchParams?.dir === "asc" ? "asc" : "desc";
  const negativeCount = flags.filter((f) => flagPolarity(f) === "negative").length;
  const positiveCount = flags.filter((f) => flagPolarity(f) === "positive").length;
  const health = computeHealthScoreV1FromFlags(flags);
  const visibleFlags = sortCompanyFlags(
    polarity
    ? flags.filter((f) => flagPolarity(f) === polarity)
    : flags,
    sort,
    dir
  );

  return (
    <div className="p-8">
      <div className="mb-6 rounded-lg border border-border bg-bg-2 p-4 border-l-[3px] border-l-border pl-4">
        <h1 className="text-card-title text-text-1">
          {company.name} — {company.series ?? "Private"} · Health:{" "}
          {health}/100 · {negativeCount} negative · {positiveCount} positive flag
          {flags.length === 1 ? "" : "s"} (from document analysis)
        </h1>
        {polarity ? (
          <p className="mt-1 text-[13px] capitalize text-text-2">
            Showing {polarity} flags only.
          </p>
        ) : null}
      </div>
      <div className="mb-4 flex justify-end gap-2">
        <SortBySelect
          value={sort}
          options={[
            { value: "severity", label: "Severity (default)" },
            { value: "confidence", label: "Confidence" },
            { value: "signal", label: "Signal type" },
          ]}
        />
        <SortDirectionSelect value={dir} />
      </div>

      <FlagGroups
        flags={visibleFlags}
        polarity={polarity}
        emptyText="No flags yet. They appear here after you upload a document and run Generate flags and analysis on the company upload page."
      />
    </div>
  );
}
