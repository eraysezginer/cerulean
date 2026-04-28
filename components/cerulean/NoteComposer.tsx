"use client";

import { useState } from "react";
import { Lock, Plus, X } from "lucide-react";
import type { Note, NoteTag } from "@/data/notes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const tags: { value: NoteTag; label: string; className: string }[] = [
  {
    value: "Context",
    label: "Context",
    className: "data-[selected=true]:bg-bg-3 data-[selected=true]:text-text-1",
  },
  {
    value: "Commitment",
    label: "Commitment",
    className: "data-[selected=true]:bg-gold-light data-[selected=true]:text-gold",
  },
  {
    value: "Concern",
    label: "Concern",
    className: "data-[selected=true]:bg-red-light data-[selected=true]:text-red",
  },
  {
    value: "Market",
    label: "Market",
    className: "data-[selected=true]:bg-teal-light data-[selected=true]:text-teal",
  },
];

const maxLength = 500;

export function NoteComposer({
  companyId,
  onSaved,
}: {
  companyId: string;
  onSaved: (note: Note) => void;
}) {
  const [tag, setTag] = useState<NoteTag>("Context");
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const trimmed = text.trim();
  const canSave = Boolean(trimmed) && !saving;

  async function saveNote() {
    if (!trimmed || saving) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/companies/${companyId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag, text: trimmed }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { note?: Note };
      if (!data.note) throw new Error("Missing note in response");
      onSaved(data.note);
      setText("");
      setTag("Context");
    } catch (e) {
      console.error(e);
      alert("Unable to save note. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-bg p-2.5 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="flex size-6 items-center justify-center rounded-lg bg-teal-light text-teal">
            <Plus className="size-3.5" aria-hidden />
          </span>
          <div>
            <p className="text-[12px] font-semibold leading-tight text-text-1">
              Add note
            </p>
            <p className="flex items-center gap-1 text-[10px] leading-tight text-text-3">
              <Lock className="size-3" aria-hidden />
              Private to you
            </p>
          </div>
        </div>
        {text ? (
          <button
            type="button"
            onClick={() => {
              setText("");
              setTag("Context");
            }}
            className="rounded-md p-1 text-text-3 hover:bg-bg-2 hover:text-text-1"
            aria-label="Clear note"
            title="Clear note"
          >
            <X className="size-3.5" aria-hidden />
          </button>
        ) : null}
      </div>

      <div className="mb-2 grid grid-cols-2 gap-1">
        {tags.map((t) => {
          const selected = tag === t.value;
          return (
            <button
              key={t.value}
              type="button"
              data-selected={selected}
              onClick={() => setTag(t.value)}
              className={cn(
                "rounded-lg border px-2 py-1 text-left text-[11px] font-medium transition-colors",
                selected
                  ? "border-transparent"
                  : "border-border bg-bg-2 text-text-3 hover:border-teal/30 hover:text-text-2",
                t.className
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <Textarea
        value={text}
        maxLength={maxLength}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            void saveNote();
          }
        }}
        placeholder="Write an observation, follow-up, or context for this company..."
        className="min-h-[92px] resize-none border-border bg-bg-2 text-[12px] leading-snug text-text-2 placeholder:text-[10px] placeholder:leading-snug placeholder:text-text-3 focus-visible:border-teal/40 focus-visible:ring-teal/20"
      />

      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-[10px] text-text-3">
          {text.length}/{maxLength} · Cmd/Ctrl + Enter
        </span>
        <Button
          type="button"
          size="sm"
          disabled={!canSave}
          onClick={saveNote}
          className="h-7 bg-teal px-3 text-[12px] text-primary-foreground hover:bg-teal/90"
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
