"use client";

import { useState } from "react";
import type { NoteTag } from "@/data/notes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const tags: NoteTag[] = ["Commitment", "Concern", "Market", "Context"];

export function NoteComposer() {
  const [tag, setTag] = useState<NoteTag>("Context");
  return (
    <div className="border-t border-border pt-3">
      <p className="mb-2 text-[12px] font-medium text-text-2">Add a note</p>
      <div className="mb-2 flex flex-wrap gap-1">
        {tags.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTag(t)}
            className={cn(
              "rounded px-2 py-0.5 text-[11px]",
              tag === t
                ? "bg-teal-light font-medium text-teal"
                : "bg-bg-3 text-text-2"
            )}
          >
            {t}
          </button>
        ))}
      </div>
      <Textarea
        placeholder="Write your observation about this company..."
        className="mb-2 min-h-[72px] resize-none border-border bg-bg text-body text-text-2"
      />
      <Button
        type="button"
        variant="secondary"
        className="w-full bg-teal-light text-teal hover:bg-teal/10"
      >
        Save note — private to you
      </Button>
    </div>
  );
}
