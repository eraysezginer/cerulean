"use client";

import { useState } from "react";
import { PencilLine } from "lucide-react";
import type { Note } from "@/data/notes";
import { cn } from "@/lib/utils";
import { NoteCard } from "./NoteCard";
import { NoteComposer } from "./NoteComposer";

const filters = ["All", "Commitment", "Concern", "Market", "Context"] as const;

export function NotesPanel({
  companyName,
  notes,
}: {
  companyName: string;
  notes: Note[];
}) {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const list =
    filter === "All"
      ? notes
      : notes.filter((n) => n.tag === filter);

  return (
    <aside className="fixed bottom-0 right-0 top-14 z-30 flex w-[240px] flex-col border-l border-border bg-bg-2">
      <div className="flex h-10 items-center gap-2 border-b border-border px-2">
        <PencilLine className="size-4 text-purple" aria-hidden />
        <span className="text-[14px] font-semibold text-text-1">My notes</span>
        <span className="ml-auto rounded bg-bg-3 px-1.5 py-0.5 text-[11px] text-text-3">
          Private · never shared
        </span>
      </div>
      <div className="flex h-7 items-center justify-between border-b border-border bg-teal/[0.05] px-2">
        <span className="text-[13px] font-semibold text-teal">{companyName}</span>
        <span className="text-[12px] text-text-3">{notes.length} notes</span>
      </div>
      <div className="flex flex-wrap gap-1 border-b border-border p-2">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "rounded px-2 py-0.5 text-[11px]",
              filter === f
                ? "bg-teal-light font-medium text-teal"
                : "bg-bg-3 text-text-2"
            )}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-2">
        {list.map((n) => (
          <NoteCard key={n.id} note={n} />
        ))}
      </div>
      <div className="p-2">
        <NoteComposer />
      </div>
    </aside>
  );
}
