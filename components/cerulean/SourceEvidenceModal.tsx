"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Confidence } from "@/data/flags";
import { getEvidenceForFlag } from "@/data/evidence";
import { ConfidenceBadge } from "./ConfidenceBadge";

export function SourceEvidenceModal({
  open,
  onOpenChange,
  flagId,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  flagId: string;
}) {
  const ev = getEvidenceForFlag(flagId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[90vh] max-w-[660px]! flex-col gap-0 overflow-hidden p-0 sm:max-w-[660px]"
      >
        <DialogHeader className="border-b border-border px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="text-card-title text-text-1">
              Source evidence
            </DialogTitle>
            <ConfidenceBadge level={ev.confidence as Confidence} />
          </div>
        </DialogHeader>
        <div className="bg-teal/[0.04] px-4 py-2 text-[13px] text-text-2">
          {ev.companyName} · {ev.updateLabel} · {ev.paragraph} · {ev.timestamp}
        </div>
        <div className="overflow-y-auto px-4 py-4">
          <p className="mb-2 text-section-label uppercase text-text-3">
            Flagged excerpt
          </p>
          <div className="mb-4 rounded-md border border-red bg-red-light/30 p-3 text-body text-text-2">
            {ev.flaggedExcerpt}
          </div>
          <p className="mb-1 rounded bg-red-light px-2 py-1 text-[13px] text-red">
            {ev.annotation}
          </p>

          <p className="mb-2 mt-6 text-section-label uppercase text-text-3">
            Historical baseline
          </p>
          <div className="space-y-2">
            {ev.historical.map((h, i) => (
              <div
                key={i}
                className="rounded-md border-l-2 border-teal bg-bg-2/60 p-2 opacity-90"
              >
                <div className="text-[12px] text-text-3">
                  {h.update} · {h.date}
                </div>
                <p className="text-body text-text-2">{h.quote}</p>
              </div>
            ))}
          </div>

          {ev.noteSection && (
            <>
              <p className="mb-2 mt-6 text-section-label uppercase text-purple">
                Your note — informed this analysis
              </p>
              <div className="rounded-md border border-purple bg-purple-light/40 p-3">
                <div className="mb-1 flex justify-between text-[12px] text-text-3">
                  <span>{ev.noteSection.tag}</span>
                  <span>{ev.noteSection.date}</span>
                </div>
                <p className="text-body text-text-2">{ev.noteSection.text}</p>
                <span className="mt-2 inline-block text-[10px] text-purple">
                  ◈ {ev.noteSection.badge}
                </span>
              </div>
            </>
          )}

          <p className="mb-2 mt-6 text-section-label uppercase text-text-3">
            Corroborating signals
          </p>
          <div className="rounded-lg bg-bg-2 p-3">
            <ul className="list-inside list-disc space-y-1 text-body text-text-2">
              {ev.corroborating.map((c, i) => (
                <li key={i}>
                  <span className="font-medium text-text-1">{c.name}:</span>{" "}
                  {c.detail}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-border bg-bg-2 px-4 py-2 font-mono text-[11px] text-text-3">
          <span className="mr-3">src: {ev.footer.sourceHash}</span>
          <span className="mr-3">notes: {ev.footer.noteIds}</span>
          <span>{ev.footer.sessionId}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
