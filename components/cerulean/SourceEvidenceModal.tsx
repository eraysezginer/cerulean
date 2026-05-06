"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { flagPolarity, type CompanyFlagDetail } from "@/data/flag-types";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { PdfHighlightViewer } from "./PdfHighlightViewer";

export function SourceEvidenceModal({
  open,
  onOpenChange,
  flag,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  flag: CompanyFlagDetail;
}) {
  const source = flag.source;
  const polarity = flagPolarity(flag);
  const hash = source?.primaryHash
    ? `sha256:${source.primaryHash.slice(0, 12)}...`
    : "Not available";
  const sourceDocumentUrl =
    source?.companyId && source.documentId
      ? `/api/companies/${encodeURIComponent(source.companyId)}/documents/${encodeURIComponent(source.documentId)}/file?index=0`
      : null;

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
            <ConfidenceBadge level={flag.confidence} />
            <span className="rounded-full bg-bg-3 px-2 py-0.5 text-[11px] font-medium capitalize text-text-2">
              {polarity}
            </span>
          </div>
        </DialogHeader>
        <div className="bg-teal/[0.04] px-4 py-2 text-[13px] text-text-2">
          {source?.companyName ?? "Company"} · {source?.fileDisplayName ?? "Uploaded document"}
        </div>
        <div className="overflow-y-auto px-4 py-4">
          <p className="mb-2 text-section-label uppercase text-text-3">
            AI flag
          </p>
          <div className="mb-4 rounded-md border border-border bg-bg-2 p-3">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <ConfidenceBadge level={flag.confidence} />
              <span className="rounded bg-bg-3 px-1.5 py-0.5 text-[10px] font-medium capitalize text-text-2">
                {polarity}
              </span>
              <span className="text-card-title text-text-1">{flag.signalType}</span>
            </div>
            <p className="text-body text-text-2">{flag.description}</p>
          </div>

          <p className="mb-2 mt-6 text-section-label uppercase text-text-3">
            Source anchor
          </p>
          <div className="rounded-md border border-teal/30 bg-teal/[0.04] p-3 font-mono text-[12px] leading-snug text-text-2">
            {flag.sourceAnchor || "No source anchor returned by the model."}
          </div>
          {sourceDocumentUrl ? (
            <div className="mt-3 space-y-2">
              <a
                href={sourceDocumentUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-8 items-center rounded-lg bg-teal px-3 text-[12px] font-medium text-primary-foreground"
              >
                Open source file →
              </a>
              <div className="overflow-hidden rounded-xl border border-border bg-bg">
                <PdfHighlightViewer
                  fileUrl={sourceDocumentUrl}
                  sourceAnchor={flag.sourceAnchor}
                  className="h-[360px] overflow-auto bg-bg-2 p-2"
                />
              </div>
            </div>
          ) : null}

          <p className="mb-2 mt-6 text-section-label uppercase text-text-3">
            Document metadata
          </p>
          <div className="grid gap-2 rounded-lg bg-bg-2 p-3 text-body text-text-2">
            <div>
              <span className="font-medium text-text-1">Update:</span>{" "}
              {source?.updateLabel || "—"}
            </div>
            <div>
              <span className="font-medium text-text-1">Document type:</span>{" "}
              {source?.documentTypeName || "—"}
            </div>
            <div>
              <span className="font-medium text-text-1">Document date:</span>{" "}
              {source?.documentDate || "—"}
            </div>
            <div>
              <span className="font-medium text-text-1">Received:</span>{" "}
              {source?.receivedDate || "—"}
            </div>
            <div>
              <span className="font-medium text-text-1">AI run:</span>{" "}
              {source?.aiAnalysisAt
                ? new Date(source.aiAnalysisAt).toLocaleString()
                : "—"}
            </div>
            <div>
              <span className="font-medium text-text-1">Model:</span>{" "}
              {source?.aiAnalysisModel || "—"}
            </div>
          </div>
        </div>
        <div className="border-t border-border bg-bg-2 px-4 py-2 font-mono text-[11px] text-text-3">
          <span className="mr-3">src: {hash}</span>
          <span className="mr-3">job: {source?.jobId ?? "—"}</span>
          <span>document: {source?.documentId ?? "—"}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
