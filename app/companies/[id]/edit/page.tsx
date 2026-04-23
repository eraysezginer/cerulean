import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AddCompanyFormProvider } from "@/contexts/AddCompanyFormContext";
import { AddCompanyWizard } from "@/components/add-company/AddCompanyWizard";
import { selectCompanyById } from "@/lib/db/company";

function Fallback() {
  return (
    <div className="px-8 py-12 text-center text-[16px] text-text-2">Loading form…</div>
  );
}

export default async function EditCompanyPage({
  params,
}: {
  params: { id: string };
}) {
  const row = await selectCompanyById(params.id);
  if (!row) notFound();

  return (
    <AddCompanyFormProvider>
      <Suspense fallback={<Fallback />}>
        <AddCompanyWizard editCompanyId={params.id} />
      </Suspense>
    </AddCompanyFormProvider>
  );
}
