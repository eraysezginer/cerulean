"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

function normalizeForWordMatch(input: string): string {
  return normalizeApostrophes(input)
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wordsFrom(input: string): string[] {
  const n = normalizeForWordMatch(input);
  return n ? n.split(" ").filter(Boolean) : [];
}

function extractItems(payload: unknown): unknown[] {
  if (typeof payload !== "object" || payload === null) return [];
  const maybe = payload as { items?: unknown };
  return Array.isArray(maybe.items) ? maybe.items : [];
}

function extractItemText(item: unknown): string {
  if (typeof item !== "object" || item === null) return "";
  const maybe = item as { str?: unknown };
  return typeof maybe.str === "string" ? maybe.str : "";
}

function extractItemIndex(item: unknown): number {
  if (typeof item !== "object" || item === null) return -1;
  const maybe = item as { itemIndex?: unknown };
  return typeof maybe.itemIndex === "number" ? maybe.itemIndex : -1;
}

function findMatchingItemIndexes(
  itemStrings: string[],
  anchorWords: string[]
): Set<number> {
  if (anchorWords.length === 0 || itemStrings.length === 0) return new Set<number>();
  const flattened: Array<{ word: string; itemIndex: number }> = [];
  for (let i = 0; i < itemStrings.length; i++) {
    const itemWords = wordsFrom(itemStrings[i] ?? "");
    for (const word of itemWords) {
      flattened.push({ word, itemIndex: i });
    }
  }
  if (flattened.length < anchorWords.length) return new Set<number>();

  for (let start = 0; start + anchorWords.length <= flattened.length; start++) {
    let ok = true;
    for (let k = 0; k < anchorWords.length; k++) {
      if (flattened[start + k]!.word !== anchorWords[k]) {
        ok = false;
        break;
      }
    }
    if (!ok) continue;
    const itemIndexes = new Set<number>();
    for (let k = 0; k < anchorWords.length; k++) {
      itemIndexes.add(flattened[start + k]!.itemIndex);
    }
    return itemIndexes;
  }
  return new Set<number>();
}

function highlightTextChunk(
  text: string,
  shouldHighlight: boolean
): string {
  if (!shouldHighlight) return escapeHtml(text);
  return `<mark class="rounded bg-yellow-300 px-0.5 text-black">${escapeHtml(text)}</mark>`;
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
  const [matchedItemsByPage, setMatchedItemsByPage] = useState<Record<number, number[]>>({});
  const [firstMatchedPage, setFirstMatchedPage] = useState<number | null>(null);
  const searchTerm = useMemo(() => sourceAnchorSearchTerm(sourceAnchor ?? "") ?? "", [sourceAnchor]);
  const anchorWords = useMemo(() => wordsFrom(searchTerm), [searchTerm]);

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
      const firstPage =
        firstMatchedPage != null
          ? wrapRef.current?.querySelector(`[data-page-number="${firstMatchedPage}"]`)
          : null;
      if (firstPage instanceof HTMLElement) {
        firstPage.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      const first = wrapRef.current?.querySelector("mark");
      if (first instanceof HTMLElement) {
        first.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 350);
    return () => window.clearTimeout(t);
  }, [searchTerm, numPages, firstMatchedPage]);

  useEffect(() => {
    setMatchedItemsByPage({});
    setFirstMatchedPage(null);
  }, [fileUrl, searchTerm]);

  const onPageText = useCallback(
    (pageNumber: number, payload: unknown) => {
      if (anchorWords.length === 0) return;
      const items = extractItems(payload);
      const itemStrings = items.map(extractItemText);
      const set = findMatchingItemIndexes(itemStrings, anchorWords);
      if (set.size === 0) return;
      const indexes = Array.from(set.values()).sort((a, b) => a - b);
      setMatchedItemsByPage((prev) => {
        const current = prev[pageNumber] ?? [];
        if (current.length === indexes.length && current.every((v, i) => v === indexes[i])) {
          return prev;
        }
        return { ...prev, [pageNumber]: indexes };
      });
      setFirstMatchedPage((prev) => (prev == null || pageNumber < prev ? pageNumber : prev));
    },
    [anchorWords]
  );

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
                data-page-number={pageNumber}
                className="mx-auto w-fit overflow-hidden rounded-lg border border-border bg-white shadow-sm"
              >
                <PdfPage
                  pageNumber={pageNumber}
                  width={pageWidth}
                  renderAnnotationLayer={false}
                  onGetTextSuccess={(payload: unknown) =>
                    onPageText(pageNumber, payload)
                  }
                  customTextRenderer={(item: unknown) => {
                    const itemIndex = extractItemIndex(item);
                    const shouldHighlight = (matchedItemsByPage[pageNumber] ?? []).includes(itemIndex);
                    return highlightTextChunk(extractItemText(item), shouldHighlight);
                  }}
                />
              </div>
            ))}
          </div>
        </PdfDocument>
      )}
    </div>
  );
}
