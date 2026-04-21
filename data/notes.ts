export type NoteTag = "Commitment" | "Concern" | "Market" | "Context";

export type Note = {
  id: string;
  tag: NoteTag;
  date: string;
  text: string;
  usedInAnalysis?: boolean;
};

export const kalderNotes: Note[] = [
  {
    id: "n1",
    tag: "Concern",
    date: "Nov 1",
    text: "Revenue narrative missing two cycles — compare to U8–U12 density.",
    usedInAnalysis: true,
  },
  {
    id: "n2",
    tag: "Market",
    date: "Oct 18",
    text: "Peer set still files revenue tables; flag if omission persists.",
  },
  {
    id: "n3",
    tag: "Commitment",
    date: "Sep 4",
    text: "Board deck mentioned FDA path — track milestone language drift.",
  },
];

export function getNotesForCompany(companyId: string): Note[] {
  if (companyId === "kalder") return kalderNotes;
  return [
    {
      id: `${companyId}-1`,
      tag: "Context",
      date: "—",
      text: "No notes yet for this company.",
    },
  ];
}
