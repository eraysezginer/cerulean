import { notFound } from "next/navigation";
import { getCompanyById } from "@/data/companies";
import { DocumentTimelineClient } from "./DocumentTimelineClient";

export default async function DocumentTimelinePage({ params }: { params: { id: string } }) {
  const company = await getCompanyById(params.id);
  if (!company) notFound();
  return <DocumentTimelineClient companyId={company.id} companyName={company.name} />;
}
