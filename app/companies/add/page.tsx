"use client";

import { Suspense } from "react";
import { AddCompanyFormProvider } from "@/contexts/AddCompanyFormContext";
import { AddCompanyWizard } from "@/components/add-company/AddCompanyWizard";

function Fallback() {
  return (
    <div className="px-8 py-12 text-center text-[16px] text-text-2">Loading form…</div>
  );
}

export default function AddCompanyPage() {
  return (
    <AddCompanyFormProvider>
      <Suspense fallback={<Fallback />}>
        <AddCompanyWizard />
      </Suspense>
    </AddCompanyFormProvider>
  );
}
