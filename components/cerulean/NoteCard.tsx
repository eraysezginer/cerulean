import { X } from "lucide-react";
import type { Note } from "@/data/notes";
import { cn } from "@/lib/utils";

const tagBg: Record<Note["tag"], string> = {
  Commitment: "bg-gold-light text-gold",
  Concern: "bg-red-light text-red",
  Market: "bg-teal-light text-teal",
  Context: "bg-bg-3 text-text-2",
};

export function NoteCard({
  note,
  isDeleting = false,
  onDelete,
}: {
  note: Note;
  isDeleting?: boolean;
  onDelete?: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-bg p-2.5 shadow-sm transition-colors",
        isDeleting && "opacity-60"
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <span
          className={cn(
            "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
            tagBg[note.tag]
          )}
        >
          {note.tag}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-text-3">{note.date}</span>
          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className="rounded-md p-0.5 text-text-3 hover:bg-red-light hover:text-red disabled:opacity-50"
              aria-label="Delete note"
              title="Delete note"
            >
              {isDeleting ? (
                <span className="block size-3.5 text-center text-[10px] leading-3.5">...</span>
              ) : (
                <X className="size-3.5" aria-hidden />
              )}
            </button>
          ) : null}
        </div>
      </div>
      <p className="whitespace-pre-wrap text-[12px] leading-snug text-text-2">
        {note.text}
      </p>
      {note.usedInAnalysis && (
        <span className="mt-2 inline-block rounded-full bg-purple/10 px-1.5 py-0.5 text-[10px] text-purple">
          ◈ Used in current analysis
        </span>
      )}
    </div>
  );
}
