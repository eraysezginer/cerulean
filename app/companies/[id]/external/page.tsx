import { notFound } from "next/navigation";
import { getCompanyById } from "@/data/companies";
import { getExternalSignalsForCompany } from "@/data/signals";
import { SignalCard } from "@/components/cerulean/SignalCard";

export default async function ExternalSignalsPage({
  params,
}: {
  params: { id: string };
}) {
  const company = await getCompanyById(params.id);
  if (!company) notFound();

  const signals = getExternalSignalsForCompany(company.id);

  return (
    <div className="p-8">
      <h1 className="mb-6 text-page-title text-text-1">
        {company.name} — External signals
      </h1>
      <div className="space-y-3">
        {signals.map((s) => (
          <SignalCard key={s.id} signal={s} />
        ))}
      </div>
    </div>
  );
}
