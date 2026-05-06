import Link from "next/link";
import { getAllCompaniesList } from "@/data/companies";
import type { CompanyRow, PortfolioFund } from "@/data/company-types";

export const dynamic = "force-dynamic";
import { CompaniesTable } from "@/components/cerulean/CompaniesTable";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const FUND_ORDER: PortfolioFund[] = ["Fund 1", "Fund 2", "Fund 3", "Fund 4", "Fund 5"];

function groupCompaniesByFund(rows: CompanyRow[]): { key: string; rows: CompanyRow[] }[] {
  const grouped = new Map<string, CompanyRow[]>();
  for (const row of rows) {
    const key = row.fund ?? "Unassigned";
    const list = grouped.get(key) ?? [];
    list.push(row);
    grouped.set(key, list);
  }

  return Array.from(grouped.entries())
    .sort((a, b) => {
      const ai = FUND_ORDER.indexOf(a[0] as PortfolioFund);
      const bi = FUND_ORDER.indexOf(b[0] as PortfolioFund);
      if (ai >= 0 && bi >= 0) return ai - bi;
      if (ai >= 0) return -1;
      if (bi >= 0) return 1;
      if (a[0] === "Unassigned") return 1;
      if (b[0] === "Unassigned") return -1;
      return a[0].localeCompare(b[0]);
    })
    .map(([key, groupRows]) => ({ key, rows: groupRows }));
}

export default async function CompaniesPage() {
  const companies = await getAllCompaniesList();
  const groups = groupCompaniesByFund(companies);
  return (
    <div className="p-8">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search companies…"
          className="max-w-xs border-border bg-bg"
        />
        <Link
          href="/companies/add?step=1"
          className={cn(
            buttonVariants(),
            "ml-auto h-9 bg-teal text-primary-foreground hover:bg-teal/90"
          )}
        >
          + Add company
        </Link>
      </div>
      <h1 className="mb-1 text-page-title text-text-1">All companies</h1>
      <p className="mb-2 text-body text-text-2">
        Portfolio coverage and signal density. Set a{" "}
        <span className="font-medium text-text-1">default company</span> for
        sidebar shortcuts; open any view from Actions.
      </p>

      <div className="mt-4 space-y-6">
        {groups.map((group) => (
          <section key={group.key}>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-text-1">{group.key}</h2>
              <span className="rounded-full bg-bg-3 px-2 py-0.5 text-[11px] text-text-2">
                {group.rows.length} compan{group.rows.length === 1 ? "y" : "ies"}
              </span>
            </div>
            <CompaniesTable rows={group.rows} />
          </section>
        ))}
      </div>
    </div>
  );
}
