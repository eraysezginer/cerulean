import Link from "next/link";
import { getAllCompaniesList } from "@/data/companies";

export const dynamic = "force-dynamic";
import { CompaniesTable } from "@/components/cerulean/CompaniesTable";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default async function CompaniesPage() {
  const companies = await getAllCompaniesList();
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

      <CompaniesTable rows={companies} />
    </div>
  );
}
