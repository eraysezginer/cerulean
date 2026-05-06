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

function normalizeApostrophes(input: string): string {
  return input.replace(/[’]/g, "'");
}

function buildMatchPlan(anchor: string): { phrases: string[]; tokens: string[] } {
  const normalized = normalizeApostrophes(anchor).toLowerCase().trim();
  if (!normalized) return { phrases: [], tokens: [] };
  const words = normalized.split(/\s+/).filter(Boolean);
  if (words.length === 0) return { phrases: [], tokens: [] };

  const phraseSet = new Set<string>();
  const maxWindow = Math.min(8, words.length);
  const minWindow = Math.min(3, maxWindow);
  for (let size = maxWindow; size >= minWindow; size--) {
    for (let i = 0; i + size <= words.length; i++) {
      phraseSet.add(words.slice(i, i + size).join(" "));
      if (phraseSet.size >= 24) break;
    }
    if (phraseSet.size >= 24) break;
  }
  if (phraseSet.size === 0) phraseSet.add(words.join(" "));

  const tokenSet = new Set(
    words
      .filter((w) => w.length >= 4)
      .slice(0, 20)
  );

  return { phrases: Array.from(phraseSet), tokens: Array.from(tokenSet) };
}

function highlightTextChunk(
  text: string,
  plan: { phrases: string[]; tokens: string[] }
): string {
  if (plan.phrases.length === 0 && plan.tokens.length === 0) return escapeHtml(text);
  const normalizedText = normalizeApostrophes(text).toLowerCase();

  let matched = "";
  let idx = -1;
  for (const phrase of plan.phrases) {
    const at = normalizedText.indexOf(phrase);
    if (at >= 0) {
      matched = phrase;
      idx = at;
      break;
    }
  }
  if (idx < 0) {
    for (const token of plan.tokens) {
      const at = normalizedText.indexOf(token);
      if (at >= 0) {
        matched = token;
        idx = at;
        break;
      }
    }
  }
  if (idx < 0 || !matched) return escapeHtml(text);

  const before = escapeHtml(text.slice(0, idx));
  const match = escapeHtml(text.slice(idx, idx + matched.length));
  const after = escapeHtml(text.slice(idx + matched.length));
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
  const matchPlan = useMemo(() => buildMatchPlan(searchTerm), [searchTerm]);

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
                  customTextRenderer={(item: { str: string }) => highlightTextChunk(item.str, matchPlan)}
                />
              </div>
            ))}
          </div>
        </PdfDocument>
      )}
    </div>
  );
}
