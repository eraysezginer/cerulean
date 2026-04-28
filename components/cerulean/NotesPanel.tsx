"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, PencilLine } from "lucide-react";
import type { Note } from "@/data/notes";
import { cn } from "@/lib/utils";
import { NoteCard } from "./NoteCard";
import { NoteComposer } from "./NoteComposer";

const filters = [
  { value: "All", label: "All", className: "data-[selected=true]:bg-teal-light data-[selected=true]:text-teal" },
  { value: "Context", label: "Context", className: "data-[selected=true]:bg-bg-3 data-[selected=true]:text-text-1" },
  { value: "Commitment", label: "Commitment", className: "data-[selected=true]:bg-gold-light data-[selected=true]:text-gold" },
  { value: "Concern", label: "Concern", className: "data-[selected=true]:bg-red-light data-[selected=true]:text-red" },
  { value: "Market", label: "Market", className: "data-[selected=true]:bg-teal-light data-[selected=true]:text-teal" },
] as const;

type NoteFilter = (typeof filters)[number]["value"];

export function NotesPanel({
  companyId,
  companyName,
  notes,
}: {
  companyId: string;
  companyName: string;
  notes: Note[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<NoteFilter>("All");
  const [items, setItems] = useState<Note[]>(notes);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setItems(notes);
  }, [notes]);

  const list =
    filter === "All"
      ? items
      : items.filter((n) => n.tag === filter);

  async function deleteNote(noteId: string) {
    setDeletingId(noteId);
    try {
      const res = await fetch(`/api/companies/${companyId}/notes/${noteId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setItems((prev) => prev.filter((n) => n.id !== noteId));
      router.refresh();
    } catch (e) {
      console.error(e);
      alert("Unable to delete note. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <aside className="fixed bottom-0 right-0 top-14 z-30 flex w-[240px] flex-col border-l border-border bg-bg-2">
      <div className="border-b border-border p-2">
        <div className="rounded-xl border border-border bg-bg p-2.5 shadow-sm">
          <div className="flex items-start gap-2">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-purple/10 text-purple">
              <PencilLine className="size-3.5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold leading-tight text-text-1">
                    My notes
                  </p>
                  <p className="truncate text-[11px] font-medium leading-tight text-teal">
                    {companyName}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-bg-3 px-1.5 py-0.5 text-[10px] font-medium text-text-3">
                  {items.length}
                </span>
              </div>
              <p className="mt-1 flex items-center gap-1 text-[10px] leading-tight text-text-3">
                <Lock className="size-3" aria-hidden />
                Private · never shared
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="border-b border-border p-2">
        <div className="grid grid-cols-2 gap-1">
          {filters.map((f) => {
            const selected = filter === f.value;
            return (
              <button
                key={f.value}
                type="button"
                data-selected={selected}
                onClick={() => setFilter(f.value)}
                className={cn(
                  "rounded-lg border px-2 py-1 text-left text-[11px] font-medium transition-colors",
                  selected
                    ? "border-transparent"
                    : "border-border bg-bg text-text-3 hover:border-teal/30 hover:text-text-2",
                  f.className
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-2">
        {list.length > 0 ? (
          list.map((n) => (
            <NoteCard
              key={n.id}
              note={n}
              isDeleting={deletingId === n.id}
              onDelete={() => deleteNote(n.id)}
            />
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-bg p-3 text-[12px] leading-snug text-text-3">
            <p className="font-medium text-text-2">No notes yet</p>
            <p className="mt-1 text-[11px]">
              Add a private note below to keep context with this company.
            </p>
          </div>
        )}
      </div>
      <div className="p-2">
        <NoteComposer
          companyId={companyId}
          onSaved={(note) => {
            setItems((prev) => [...prev, note]);
            router.refresh();
          }}
        />
      </div>
    </aside>
  );
}
