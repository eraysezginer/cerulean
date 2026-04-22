import { NextResponse } from "next/server";
import type { AddCompanyForm } from "@/lib/add-company-types";
import { mapUpdateFrequencyToCadence } from "@/lib/add-company-types";
import {
  newCompanyFromForm,
  registerCompany,
} from "@/lib/company-registry";
import { registerNotesForCompany } from "@/lib/notes-registry";
import { slugifyName } from "@/lib/slugify";
import { companies } from "@/data/companies";
import type { Note } from "@/data/notes";
import { listAddedCompanies } from "@/lib/company-registry";

function uniqueCompanyId(base: string): string {
  const taken = new Set([
    ...companies.map((c) => c.id),
    ...listAddedCompanies().map((c) => c.id),
  ]);
  let id = base;
  let n = 2;
  while (taken.has(id)) {
    id = `${base}-${n}`;
    n += 1;
  }
  return id;
}

function noteDateFromInvestmentDate(s: string): string {
  const t = s.trim();
  if (!t) return "—";
  return t;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AddCompanyForm;
    const legal = body.legalName?.trim() || "Company";
    const baseId = slugifyName(legal);
    const companyId = uniqueCompanyId(baseId);

    const cadence = mapUpdateFrequencyToCadence(body.updateFrequency);

    registerCompany(
      newCompanyFromForm({
        id: companyId,
        name: legal,
        cadence,
      })
    );

    const noteDate = noteDateFromInvestmentDate(body.investmentDate);
    const notes: Note[] = [];
    let i = 0;
    const add = (tag: Note["tag"], text: string) => {
      const t = text.trim();
      if (!t) return;
      i += 1;
      notes.push({
        id: `${companyId}-n${i}`,
        tag,
        date: noteDate,
        text: t,
      });
    };
    add("Market", body.thesisNote);
    add("Concern", body.risksNote);
    add("Commitment", body.commitmentsNote);
    add("Context", body.contextNote);

    if (notes.length > 0) {
      registerNotesForCompany(companyId, notes);
    }

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
