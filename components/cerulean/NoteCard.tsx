import type { Note } from "@/data/notes";
import { cn } from "@/lib/utils";

const tagBorder: Record<
  Note["tag"],
  string
> = {
  Commitment: "border-l-gold",
  Concern: "border-l-red",
  Market: "border-l-teal",
  Context: "border-l-text-3",
};

const tagBg: Record<Note["tag"], string> = {
  Commitment: "bg-gold-light text-gold",
  Concern: "bg-red-light text-red",
  Market: "bg-teal-light text-teal",
  Context: "bg-bg-3 text-text-2",
};

export function NoteCard({ note }: { note: Note }) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-bg p-2 pl-2",
        "border-l-[2px]",
        tagBorder[note.tag]
      )}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <span
          className={cn(
            "rounded px-1.5 py-0.5 text-[11px] font-medium",
            tagBg[note.tag]
          )}
        >
          {note.tag}
        </span>
        <span className="text-[11px] text-text-3">{note.date}</span>
      </div>
      <p className="text-[11px] leading-snug text-text-2">{note.text}</p>
      {note.usedInAnalysis && (
        <span className="mt-1 inline-block text-[10px] text-purple">
          ◈ Used in current analysis
        </span>
      )}
    </div>
  );
}
