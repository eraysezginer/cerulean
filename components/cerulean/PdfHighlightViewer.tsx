"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { sourceAnchorSearchTerm } from "@/lib/source-anchor";

const PdfDocument = dynamic(() => import("react-pdf").then((m) => m.Document), { ssr: false });
const PdfPage = dynamic(() => import("react-pdf").then((m) => m.Page), { ssr: false });

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function highlightTextChunk(text: string, needle: string): string {
  if (!needle) return escapeHtml(text);
  const lower = text.toLowerCase();
  const idx = lower.indexOf(needle);
  if (idx < 0) return escapeHtml(text);
  const before = escapeHtml(text.slice(0, idx));
  const match = escapeHtml(text.slice(idx, idx + needle.length));
  const after = escapeHtml(text.slice(idx + needle.length));
  return `${before}<mark class="rounded bg-yellow-200 px-0.5 text-current">${match}</mark>${after}`;
}

export function PdfHighlightViewer({
  fileUrl,
  sourceAnchor,
  className,
}: {
  fileUrl: string;
  sourceAnchor?: string;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageWidth, setPageWidth] = useState<number>(760);
  const [isPdfReady, setIsPdfReady] = useState(false);
  const searchTerm = useMemo(() => sourceAnchorSearchTerm(sourceAnchor ?? "") ?? "", [sourceAnchor]);

  useEffect(() => {
    let cancelled = false;
    void import("react-pdf").then((m) => {
      m.pdfjs.GlobalWorkerOptions.workerSrc =
        "https://unpkg.com/pdfjs-dist@5.4.296/build/pdf.worker.min.mjs";
      if (!cancelled) setIsPdfReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = Math.max(320, Math.floor(el.clientWidth - 24));
      setPageWidth(w);
    });
    ro.observe(el);
    setPageWidth(Math.max(320, Math.floor(el.clientWidth - 24)));
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!searchTerm || !numPages) return;
    const t = window.setTimeout(() => {
      const first = wrapRef.current?.querySelector("mark");
      if (first instanceof HTMLElement) {
        first.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 350);
    return () => window.clearTimeout(t);
  }, [searchTerm, numPages]);

  return (
    <div ref={wrapRef} className={className ?? "h-full overflow-auto bg-bg-2 p-3"}>
      {searchTerm ? (
        <div className="mb-2 rounded-md border border-teal/30 bg-teal/[0.06] px-2 py-1 text-[11px] text-text-2">
          Search anchor: &quot;{searchTerm}&quot;
        </div>
      ) : null}
      {!isPdfReady ? (
        <div className="p-3 text-[12px] text-text-2">Loading PDF viewer…</div>
      ) : (
        <PdfDocument
          file={fileUrl}
          onLoadSuccess={({ numPages: pages }: { numPages: number }) => setNumPages(pages)}
          loading={<div className="p-3 text-[12px] text-text-2">Loading PDF…</div>}
          error={<div className="p-3 text-[12px] text-red">PDF could not be loaded.</div>}
        >
          <div className="space-y-3">
            {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNumber) => (
              <div
                key={pageNumber}
                className="mx-auto w-fit overflow-hidden rounded-lg border border-border bg-white shadow-sm"
              >
                <PdfPage
                  pageNumber={pageNumber}
                  width={pageWidth}
                  renderAnnotationLayer={false}
                  customTextRenderer={(item: { str: string }) =>
                    highlightTextChunk(item.str, searchTerm.toLowerCase())
                  }
                />
              </div>
            ))}
          </div>
        </PdfDocument>
      )}
    </div>
  );
}
