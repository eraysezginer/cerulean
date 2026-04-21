import { notFound } from "next/navigation";
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
      <div className="pr-[240px]">{children}</div>
      <NotesPanel companyName={company.name} notes={notes} />
    </>
  );
}
