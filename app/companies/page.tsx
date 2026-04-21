import { companies } from "@/data/companies";
import { CompaniesTable } from "@/components/cerulean/CompaniesTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      <p className="mb-2 text-body text-text-2">
        Portfolio coverage and signal density. Set a{" "}
        <span className="font-medium text-text-1">default company</span> for
        sidebar shortcuts; open any view from Actions.
      </p>

      <CompaniesTable rows={companies} />
    </div>
  );
}
