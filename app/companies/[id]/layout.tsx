import { notFound } from "next/navigation";
import { CompanySwitcher } from "@/components/cerulean/CompanySwitcher";
import { NotesPanel } from "@/components/cerulean/NotesPanel";
import { getCompanyById } from "@/data/companies";
import { getNotesForCompany } from "@/data/notes";

export default function CompanyIdLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const company = getCompanyById(params.id);
  if (!company) notFound();

  const notes = getNotesForCompany(company.id);

  return (
    <>
      <div className="pr-[240px]">
        <div className="border-b border-border/70 bg-gradient-to-r from-bg via-bg to-teal-light/30 px-8 py-4">
          <CompanySwitcher companyId={company.id} />
        </div>
        {children}
      </div>
      <NotesPanel companyName={company.name} notes={notes} />
    </>
  );
}
