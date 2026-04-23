import type { AddCompanyForm } from "@/lib/add-company-types";
import type { Note } from "@/data/notes";

function noteDateFromInvestmentDate(s: string): string {
  const t = s.trim();
  if (!t) return "—";
  return t;
}

/** Wizard doldurulmuş not alanlarından sıra ile n1, n2, … üretir (POST / PATCH ile aynı kurallar). */
export function wizardNotesFromAddCompanyForm(
  companyId: string,
  body: AddCompanyForm
): { id: string; tag: string; date: string; text: string }[] {
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

  return toCreate.map((n, i) => ({
    id: `${companyId}-n${i + 1}`,
    tag: n.tag,
    date: noteDate,
    text: n.text,
  }));
}
