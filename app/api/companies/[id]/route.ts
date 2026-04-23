import { NextResponse } from "next/server";
import type { AddCompanyForm } from "@/lib/add-company-types";
import { initialAddCompanyForm, mapUpdateFrequencyToCadence } from "@/lib/add-company-types";
import { wizardNotesFromAddCompanyForm } from "@/lib/company-wizard-notes";
import { deleteCompanyAndRelatedData, selectCompanyById, updateCompanyWithNotes } from "@/lib/db/company";
import { forgetTimelineForCompany } from "@/lib/timeline-store";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const row = await selectCompanyById(params.id);
    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    let parsed: Partial<AddCompanyForm>;
    try {
      parsed = JSON.parse(row.formData) as AddCompanyForm;
    } catch {
      return NextResponse.json({ error: "Invalid stored form" }, { status: 500 });
    }
    const form = { ...initialAddCompanyForm, ...parsed };
    return NextResponse.json({ form });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const row = await selectCompanyById(params.id);
    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const body = (await req.json()) as AddCompanyForm;
    const legal = body.legalName?.trim() || row.legalName;
    const cadence = mapUpdateFrequencyToCadence(body.updateFrequency);
    const formDataJson = JSON.stringify(body);
    const notes = wizardNotesFromAddCompanyForm(params.id, body);
    await updateCompanyWithNotes({
      companyId: params.id,
      legalName: legal,
      cadence,
      formDataJson,
      notes,
    });
    return NextResponse.json({ companyId: params.id, forwardingAddress: body.forwardingAddress });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Unable to update company" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const removed = await deleteCompanyAndRelatedData(params.id);
    if (!removed) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    forgetTimelineForCompany(params.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Unable to remove company" },
      { status: 500 }
    );
  }
}
