import { NextResponse } from "next/server";
import type { AddCompanyForm } from "@/lib/add-company-types";
import { mapUpdateFrequencyToCadence } from "@/lib/add-company-types";
import { uniqueCompanyIdForLegalName } from "@/lib/unique-company-id";
import { insertCompanyWithNotes } from "@/lib/db/company";
import type { Note } from "@/data/notes";

function noteDateFromInvestmentDate(s: string): string {
  const t = s.trim();
  if (!t) return "—";
  return t;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AddCompanyForm;
    const legal = body.legalName?.trim() || "Company";
    const companyId = await uniqueCompanyIdForLegalName(legal);
    const cadence = mapUpdateFrequencyToCadence(body.updateFrequency);
    const formDataJson = JSON.stringify(body);

    const noteDate = noteDateFromInvestmentDate(body.investmentDate);
    const toCreate: { tag: Note["tag"]; text: string }[] = [];
    const add = (tag: Note["tag"], text: string) => {
      const t = text.trim();
      if (!t) return;
      toCreate.push({ tag, text: t });
    };
    add("Market", body.thesisNote);
    add("Concern", body.risksNote);
    add("Commitment", body.commitmentsNote);
    add("Context", body.contextNote);

    const notes = toCreate.map((n, i) => ({
      id: `${companyId}-n${i + 1}`,
      tag: n.tag,
      date: noteDate,
      text: n.text,
    }));

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
