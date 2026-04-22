import { notFound } from "next/navigation";
import { CompanyIdChrome } from "@/components/cerulean/CompanyIdChrome";
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
    <CompanyIdChrome companyId={company.id} companyName={company.name} notes={notes}>
      {children}
    </CompanyIdChrome>
  );
}
