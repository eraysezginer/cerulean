import { notFound } from "next/navigation";
import { CompanyIdChrome } from "@/components/cerulean/CompanyIdChrome";
import { getAllCompaniesList, getCompanyById } from "@/data/companies";
import { getNotesForCompany } from "@/data/notes";

export default async function CompanyIdLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const company = await getCompanyById(params.id);
  if (!company) notFound();

  const [notes, portfolioCompanies] = await Promise.all([
    getNotesForCompany(company.id),
    getAllCompaniesList(),
  ]);

  return (
    <CompanyIdChrome
      companyId={company.id}
      companyName={company.name}
      notes={notes}
      portfolioCompanies={portfolioCompanies}
    >
      {children}
    </CompanyIdChrome>
  );
}
