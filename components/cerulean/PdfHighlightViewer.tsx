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
      .filter((w) => w.length >= 3)
      .slice(0, 24)
  );
  for (const w of words) {
    if (w.length >= 5) tokenSet.add(w.slice(0, 4));
    if (tokenSet.size >= 32) break;
  }

  return { phrases: Array.from(phraseSet), tokens: Array.from(tokenSet) };
}

function mergeRanges(ranges: Array<{ start: number; end: number }>): Array<{ start: number; end: number }> {
  if (ranges.length === 0) return [];
  const sorted = [...ranges].sort((a, b) => a.start - b.start || a.end - b.end);
  const out: Array<{ start: number; end: number }> = [sorted[0]!];
  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i]!;
    const prev = out[out.length - 1]!;
    if (current.start <= prev.end) {
      prev.end = Math.max(prev.end, current.end);
    } else {
      out.push({ ...current });
    }
  }
  return out;
}

function collectRanges(haystack: string, needles: string[]): Array<{ start: number; end: number }> {
  const out: Array<{ start: number; end: number }> = [];
  for (const needle of needles) {
    if (!needle) continue;
    let from = 0;
    while (from < haystack.length) {
      const idx = haystack.indexOf(needle, from);
      if (idx < 0) break;
      out.push({ start: idx, end: idx + needle.length });
      from = idx + Math.max(1, needle.length);
    }
  }
  return out;
}

function highlightTextChunk(
  text: string,
  plan: { phrases: string[]; tokens: string[] }
): string {
  if (plan.phrases.length === 0 && plan.tokens.length === 0) return escapeHtml(text);
  const normalizedText = normalizeApostrophes(text).toLowerCase();
  const phraseRanges = collectRanges(normalizedText, plan.phrases);
  const tokenRanges = collectRanges(normalizedText, plan.tokens);
  const ranges = mergeRanges([...phraseRanges, ...tokenRanges]);
  if (ranges.length === 0) return escapeHtml(text);

  let cursor = 0;
  let html = "";
  for (const range of ranges) {
    if (range.start > cursor) {
      html += escapeHtml(text.slice(cursor, range.start));
    }
    html += `<mark class="rounded bg-yellow-300 px-0.5 text-black">${escapeHtml(
      text.slice(range.start, range.end)
    )}</mark>`;
    cursor = range.end;
  }
  if (cursor < text.length) {
    html += escapeHtml(text.slice(cursor));
  }
  return html;
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
