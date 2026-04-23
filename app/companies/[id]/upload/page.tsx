import { notFound } from "next/navigation";
import { getCompanyById } from "@/data/companies";
import { UploadFileClient } from "./UploadFileClient";

export default async function CompanyUploadPage({ params }: { params: { id: string } }) {
  const company = await getCompanyById(params.id);
  if (!company) notFound();
  return <UploadFileClient company={company} />;
}
