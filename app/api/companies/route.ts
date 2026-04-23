import { NextResponse } from "next/server";
import type { AddCompanyForm } from "@/lib/add-company-types";
import { mapUpdateFrequencyToCadence } from "@/lib/add-company-types";
import { wizardNotesFromAddCompanyForm } from "@/lib/company-wizard-notes";
import { uniqueCompanyIdForLegalName } from "@/lib/unique-company-id";
import { insertCompanyWithNotes } from "@/lib/db/company";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AddCompanyForm;
    const legal = body.legalName?.trim() || "Company";
    const companyId = await uniqueCompanyIdForLegalName(legal);
    const cadence = mapUpdateFrequencyToCadence(body.updateFrequency);
    const formDataJson = JSON.stringify(body);

    const notes = wizardNotesFromAddCompanyForm(companyId, body);

    await insertCompanyWithNotes({
      companyId,
      legalName: legal,
      cadence,
      formDataJson,
      notes,
    });

    return NextResponse.json({
      companyId,
      forwardingAddress: body.forwardingAddress,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Unable to add company" },
      { status: 500 }
    );
  }
}
