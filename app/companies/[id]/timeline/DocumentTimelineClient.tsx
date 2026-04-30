"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  MouseSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, horizontalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TimelineDocument, TimelineType } from "@/data/timeline";
import { getAccentClasses, getCardAccent, typeLetter } from "@/lib/timeline-ui";
import { cn } from "@/lib/utils";

const DOT_HEX: Record<ReturnType<typeof getCardAccent>, string> = {
  teal: "#0B7275",
  amber: "#B85A1A",
  red: "#CC2222",
  purple: "#544AA0",
  green: "#1A7A4A",
};

function typeShort(t: TimelineType): string {
  const m: Record<TimelineType, string> = {
    investor_update: "UPDATE",
    ppm: "PPM",
    financial: "FIN",
    captable: "CAP",
    pitch_deck: "DECK",
    board_deck: "BRD",
    side_letter: "SIDE",
    reference: "REF",
  };
  return m[t] ?? t;
}

function fmtShort(d: string): string {
  const x = new Date(d + (d.length <= 10 ? "T12:00:00" : ""));
  if (Number.isNaN(x.getTime())) return d;
  return x.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" });
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function canPreviewFile(name: string): boolean {
  const ext = name.toLowerCase().split(".").pop();
  return ext === "pdf" || ext === "txt" || ext === "eml";
}

function parseDocTime(d: string): number | null {
  const x = new Date(d + (d.length <= 10 ? "T12:00:00" : ""));
  return Number.isNaN(x.getTime()) ? null : x.getTime();
}

function addDays(ms: number, days: number): number {
  return ms + days * 24 * 60 * 60 * 1000;
}

function formatTick(ms: number, range: number): string {
  if (range <= 90 * 24 * 60 * 60 * 1000) {
    return new Date(ms).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function buildTimelineScale(docs: TimelineDocument[]) {
  const dated = docs
    .map((d) => ({ id: d.id, t: parseDocTime(d.documentDate) }))
    .filter((d): d is { id: string; t: number } => d.t != null);
  if (dated.length === 0) {
    return { ticks: [] as { label: string; p: number }[], positions: new Map<string, number>() };
  }

  const minT = Math.min(...dated.map((d) => d.t));
  const maxT = Math.max(...dated.map((d) => d.t));
  const span = Math.max(1, maxT - minT);
  const pad = Math.max(span * 0.12, 7 * 24 * 60 * 60 * 1000);
  const start = addDays(minT - pad, -1);
  const end = addDays(maxT + pad, 1);
  const range = Math.max(1, end - start);

  const positions = new Map<string, number>();
  for (const d of dated) {
    positions.set(d.id, Math.min(0.96, Math.max(0.04, (d.t - start) / range)));
  }

  const tickCount = Math.min(6, Math.max(2, dated.length));
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const p = tickCount === 1 ? 0.5 : i / (tickCount - 1);
    return { label: formatTick(start + p * range, range), p };
  });

  return { ticks, positions };
}

function spreadMarkerPositions(
  docs: TimelineDocument[],
  basePositions: Map<string, number>,
  trackWidth: number
): Map<string, number> {
  if (docs.length <= 1) return new Map(basePositions);

  const minGapPx = 58;
  const minGap = minGapPx / Math.max(1, trackWidth);
  const sorted = docs
    .map((d, i) => ({
      id: d.id,
      i,
      p: basePositions.get(d.id) ?? (i + 0.5) / docs.length,
    }))
    .sort((a, b) => a.p - b.p || a.i - b.i);

  const placed = sorted.map((item, i) => ({
    ...item,
    p: i === 0 ? item.p : Math.max(item.p, sorted[i - 1]!.p + minGap),
  }));

  for (let i = 1; i < placed.length; i++) {
    placed[i]!.p = Math.max(placed[i]!.p, placed[i - 1]!.p + minGap);
  }

  const overflow = placed[placed.length - 1]!.p - 0.96;
  if (overflow > 0) {
    for (const item of placed) item.p -= overflow;
  }

  for (let i = placed.length - 2; i >= 0; i--) {
    placed[i]!.p = Math.min(placed[i]!.p, placed[i + 1]!.p - minGap);
  }

  const underflow = 0.04 - placed[0]!.p;
  if (underflow > 0) {
    for (const item of placed) item.p += underflow;
  }

  const out = new Map<string, number>();
  for (const item of placed) {
    out.set(item.id, Math.min(0.96, Math.max(0.04, item.p)));
  }
  return out;
}

export function DocumentTimelineClient({
  companyId,
  companyName,
}: {
  companyId: string;
  companyName: string;
}) {
  const [docs, setDocs] = useState<TimelineDocument[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [reorder, setReorder] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TimelineDocument | null>(null);
  const [deletePos, setDeletePos] = useState<{ top: number; left: number } | null>(null);
  const [previewDoc, setPreviewDoc] = useState<TimelineDocument | null>(null);
  const [toast, setToast] = useState<"ok" | "err" | null>(null);
  const [activeDrag, setActiveDrag] = useState<TimelineDocument | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    const r = await fetch(`/api/companies/${companyId}/documents`);
    if (!r.ok) {
      setErr("Could not load documents.");
      return;
    }
    setDocs((await r.json()) as TimelineDocument[]);
  }, [companyId]);

  useEffect(() => {
    void load();
  }, [load]);

  const sensors = useSensors(useSensor(MouseSensor, { activationConstraint: { distance: 8 } }));
  const timeline = useMemo(() => buildTimelineScale(docs ?? []), [docs]);

  const patchReorder = useCallback(
    async (newIds: string[]) => {
      setDocs((prev) => {
        if (!prev) return prev;
        const byId = new Map(prev.map((d) => [d.id, d]));
        const out: TimelineDocument[] = [];
        for (let i = 0; i < newIds.length; i++) {
          const b = byId.get(newIds[i]!);
          if (b) out.push({ ...b, sequencePosition: i });
        }
        return out.length ? out : prev;
      });
      const r = await fetch(`/api/companies/${companyId}/documents/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentIds: newIds }),
      });
      if (!r.ok) {
        void load();
        setToast("err");
        setTimeout(() => setToast(null), 2500);
        return;
      }
      setToast("ok");
      setTimeout(() => setToast(null), 2000);
    },
    [companyId, load]
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveDrag(null);
    if (!over || !docs) return;
    if (active.id === over.id) return;
    const oldIndex = docs.findIndex((d) => d.id === String(active.id));
    const newIndex = docs.findIndex((d) => d.id === String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    const newOrder = arrayMove(
      docs.map((d) => d.id),
      oldIndex,
      newIndex
    );
    void patchReorder(newOrder);
  };

  const confirmDelete = async (doc: TimelineDocument) => {
    const r = await fetch(`/api/companies/${companyId}/documents/${doc.id}`, { method: "DELETE" });
    if (r.status === 503) {
      setDeleteTarget(null);
      setDeletePos(null);
      setToast("err");
      setTimeout(() => setToast(null), 2500);
      return;
    }
    if (!r.ok) {
      setDeleteTarget(null);
      setDeletePos(null);
      setToast("err");
      setTimeout(() => setToast(null), 2500);
      return;
    }
    setDeleteTarget(null);
    setDeletePos(null);
    setDocs((d) => {
      if (!d) return d;
      return d
        .filter((x) => x.id !== doc.id)
        .map((x, i) => ({ ...x, sequencePosition: i }));
    });
    setToast("ok");
    setTimeout(() => setToast(null), 2000);
  };

  const openDelete = (doc: TimelineDocument, cardEl: HTMLElement | null) => {
    setDeleteTarget(doc);
    if (cardEl) {
      const r = cardEl.getBoundingClientRect();
      const w = 268;
      const h = 200;
      const topSpace = r.top;
      const below = topSpace < h + 16;
      setDeletePos({
        left: Math.min(window.innerWidth - w - 16, Math.max(8, r.left + r.width / 2 - w / 2)),
        top: below ? r.bottom + 8 : r.top - h - 8,
      });
    } else {
      setDeletePos({ top: 80, left: window.innerWidth / 2 - 134 });
    }
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (reorder) setReorder(false);
        if (deleteTarget) {
          setDeleteTarget(null);
          setDeletePos(null);
        }
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [reorder, deleteTarget]);

  const stats = useMemo(() => {
    if (!docs) return { n: 0, inv: 0, ref: 0, flags: 0 };
    return {
      n: docs.length,
      inv: docs.filter((d) => d.type === "investor_update").length,
      ref: docs.filter((d) => d.isReference).length,
      flags: docs.reduce((a, d) => a + d.flagCount, 0),
    };
  }, [docs]);

  if (err) {
    return <div className="p-6 text-red">{err}</div>;
  }
  if (docs == null) {
    return <div className="p-6 text-text-2">Loading…</div>;
  }

  const n = docs.length;
  const trackW = Math.max(980, n * 180);
  const markerPositions = spreadMarkerPositions(docs, timeline.positions, trackW);

  return (
    <div className="relative min-h-0 flex-1 bg-bg p-6">
      {deleteTarget ? (
        <div
          role="presentation"
          className="pointer-events-auto fixed inset-0 z-[65]"
          style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
          onClick={() => {
            setDeleteTarget(null);
            setDeletePos(null);
          }}
        />
      ) : null}

      <nav className="mb-2 flex flex-wrap items-center gap-1.5 text-[14px] text-text-2">
        <Link href="/companies" className="hover:text-text-1">
          Portfolio
        </Link>
        <span className="text-text-3">›</span>
        <Link href={`/companies/${companyId}/flags`} className="hover:text-text-1">
          {companyName}
        </Link>
        <span className="text-text-3">›</span>
        <span className="text-text-1">Document timeline</span>
      </nav>

      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-[22px] font-semibold text-text-1">Document timeline</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/companies/${companyId}/upload`}
            className="inline-flex h-8 items-center rounded-md bg-teal px-3 text-[14px] font-medium text-primary-foreground"
          >
            + Upload file
          </Link>
          <Button
            type="button"
            onClick={() => setReorder((v) => !v)}
            className={cn(
              "h-8 rounded-md border border-border px-3 text-[14px] font-medium text-text-1",
              "bg-bg-2 shadow-sm hover:bg-bg-3",
              reorder && "border-amber/60 bg-amber-light text-amber-900 shadow-none hover:bg-amber-light/90"
            )}
          >
            ⇄ Reorder
          </Button>
        </div>
      </div>

      {reorder ? (
        <div className="mb-3 flex w-full items-center justify-between gap-2 rounded border border-amber/40 bg-amber-light px-3 py-2 text-[12px] text-amber-900">
          <span>
            ⇄ Reorder mode — drag cards to change sequence · Changes auto-save to database · Escape or Done to
            exit
          </span>
          <Button
            type="button"
            onClick={() => setReorder(false)}
            className="h-7 shrink-0 bg-amber px-3 text-[12px] text-primary-foreground"
          >
            Done
          </Button>
        </div>
      ) : (
        <div
          className="mb-4 flex w-full items-center justify-center rounded-xl border border-teal/15 bg-teal/[0.04] px-3 py-2 text-[12px] text-teal"
        >
          {stats.n} documents · {stats.inv} investor updates · {stats.ref} reference documents · {stats.flags}{" "}
          active flags · Positions follow document date
        </div>
      )}

      {reorder ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={({ active }) => {
            setActiveDrag(docs.find((d) => d.id === String(active.id)) ?? null);
          }}
          onDragEnd={onDragEnd}
          onDragCancel={() => setActiveDrag(null)}
        >
          <SortableContext items={docs.map((d) => d.id)} strategy={horizontalListSortingStrategy}>
            <div className="flex min-h-[120px] flex-wrap gap-3 overflow-x-auto py-2 pb-4">
              {docs.map((d) => (
                <SortableRow key={d.id} doc={d} onDelete={openDelete} dim={deleteTarget?.id === d.id} />
              ))}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeDrag ? (
              <div className="w-[70px] rounded-lg border-2 border-amber/70 bg-bg-2 p-1 text-center text-[10px] shadow-md">
                {activeDrag.label}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="space-y-5">
          <div className="overflow-x-auto rounded-2xl border border-border bg-bg-2 p-4 shadow-sm">
          <div
            className="relative select-none"
            style={{ minWidth: trackW, height: 148 }}
          >
            <div
              className="pointer-events-none absolute left-0 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white shadow-sm"
              style={{ top: 72, background: "#0B7275" }}
            />
            <div
              className="pointer-events-none absolute right-0 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white shadow-sm"
              style={{ top: 72, background: "#0B7275" }}
            />
            <div
              className="absolute right-0 left-0 h-0.5 rounded-full"
              style={{ top: 72, backgroundColor: "rgba(11, 114, 117, 0.35)" }}
            />
            {timeline.ticks.map((q) => (
              <div
                key={q.label}
                className="pointer-events-none absolute flex flex-col items-center"
                style={{ left: `${q.p * 100}%`, top: 72, transform: "translateX(-50%)" }}
              >
                <div className="h-4 w-px" style={{ backgroundColor: "rgba(11, 114, 117, 0.35)" }} />
                <span className="mt-2 rounded-full bg-bg px-2 py-0.5 text-[11px] text-text-3 shadow-sm">
                  {q.label}
                </span>
              </div>
            ))}

            {docs.map((d, i) => {
              const position = markerPositions.get(d.id) ?? (i + 0.5) / n;
              const accent = getCardAccent(d);
              const hex = DOT_HEX[accent];
              return (
                <div
                  key={d.id}
                  className="absolute flex -translate-x-1/2 flex-col items-center gap-1"
                  style={{ left: `${position * 100}%`, top: i % 2 === 0 ? 31 : 70 }}
                >
                  {i % 2 === 0 ? (
                    <span className="rounded-full bg-bg px-1.5 py-0.5 text-[10px] font-medium text-text-2 shadow-sm">
                      {fmtShort(d.documentDate)}
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setPreviewDoc(d)}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-[12px] font-semibold text-white shadow-md transition-transform hover:scale-110",
                      deleteTarget?.id === d.id && "opacity-30"
                    )}
                    style={{ backgroundColor: hex }}
                    aria-label={`Preview ${d.label}`}
                    title={`${d.label} · ${fmtShort(d.documentDate)}`}
                  >
                    {typeLetter(d)}
                  </button>
                  {i % 2 !== 0 ? (
                    <span className="rounded-full bg-bg px-1.5 py-0.5 text-[10px] font-medium text-text-2 shadow-sm">
                      {fmtShort(d.documentDate)}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {docs.map((d) => (
              <TimelineDocumentCard
                key={d.id}
                doc={d}
                dim={deleteTarget?.id === d.id}
                onDelete={openDelete}
                onPreview={setPreviewDoc}
              />
            ))}
          </div>
        </div>
      )}

      <p className="mt-6 inline-block max-w-xl rounded-full bg-bg-3 px-2 py-1 text-[9px] text-text-3">
        ⚠ Deletions are permanent and logged to the audit record with your credentials
      </p>

      {toast === "ok" && (
        <div className="fixed bottom-6 left-6 z-[100] rounded-md bg-green px-3 py-1.5 text-[12px] text-primary-foreground shadow">
          ✓ Auto-saving · Sync to database
        </div>
      )}
      {toast === "err" && (
        <div className="fixed bottom-6 left-6 z-[100] max-w-sm rounded-md bg-red px-3 py-1.5 text-[12px] text-primary-foreground shadow">
          Update failed on the server. List restored.
        </div>
      )}

      {deleteTarget && deletePos
        ? createPortal(
            <div
              className="fixed z-[80] w-[268px] rounded-xl border border-red bg-bg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              style={{ top: deletePos.top, left: deletePos.left, borderTopWidth: 4, borderTopColor: "#cc2222" }}
            >
              <div className="p-3">
                <p className="text-[12px] font-semibold text-text-1">Delete this document?</p>
                <p className="mt-0.5 text-[11px] text-text-2">
                  {deleteTarget.label} · {fmtShort(deleteTarget.documentDate)} · {typeShort(deleteTarget.type)} ·{" "}
                  {deleteTarget.flagCount} active flags
                </p>
                <div className="mt-2 rounded border border-red/25 p-2 text-[11px] text-text-1" style={{ backgroundColor: "rgba(204, 34, 34, 0.06)" }}>
                  Deleting this document removes its {deleteTarget.flagCount} flags from the portfolio record and
                  updates the temporal baseline.
                </div>
                <p className="mt-1 text-[9px] text-text-3">This action cannot be undone.</p>
                <div className="mt-3 flex gap-2">
                  <Button
                    type="button"
                    className="h-7 w-[76px] bg-bg-3 text-text-2"
                    onClick={() => {
                      setDeleteTarget(null);
                      setDeletePos(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    className="h-7 min-w-[96px] bg-red text-primary-foreground"
                    onClick={() => {
                      void confirmDelete(deleteTarget);
                    }}
                  >
                    Delete permanently
                  </Button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}

      <DocumentPreviewDialog
        doc={previewDoc}
        open={previewDoc != null}
        onOpenChange={(open) => {
          if (!open) setPreviewDoc(null);
        }}
      />

    </div>
  );
}

function DocumentPreviewDialog({
  doc,
  open,
  onOpenChange,
}: {
  doc: TimelineDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [fileIndex, setFileIndex] = useState(0);
  const [activePanel, setActivePanel] = useState<"file" | "flags">("file");

  useEffect(() => {
    if (open) {
      setFileIndex(0);
      setActivePanel("file");
    }
  }, [open, doc?.id]);

  const file = doc?.files[fileIndex];
  const previewable = file ? canPreviewFile(file.originalName) : false;
  const flags = doc?.flags ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex h-[86vh] max-w-[min(1100px,calc(100vw-2rem))]! flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(1100px,calc(100vw-2rem))]"
      >
        <DialogHeader className="border-b border-border px-4 py-3">
          <DialogTitle className="text-card-title text-text-1">
            {doc?.label ?? "Document"}
          </DialogTitle>
          {doc ? (
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-text-3">
              <span>{typeShort(doc.type)}</span>
              <span>{fmtShort(doc.documentDate)}</span>
              <span>{doc.flagCount} flags</span>
              <span>{doc.hash.slice(0, 12)}...</span>
            </div>
          ) : null}
        </DialogHeader>

        <div className="grid min-h-0 flex-1 grid-cols-[260px_minmax(0,1fr)]">
          <aside className="border-r border-border bg-bg-2 p-3">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-text-3">
              Files
            </p>
            <div className="space-y-1.5">
              {doc?.files.length ? (
                doc.files.map((f, i) => (
                  <button
                    key={`${f.originalName}-${i}`}
                    type="button"
                    onClick={() => {
                      setFileIndex(i);
                      setActivePanel("file");
                    }}
                    className={cn(
                      "w-full rounded-lg border px-2 py-2 text-left transition-colors",
                      activePanel === "file" && i === fileIndex
                        ? "border-teal/40 bg-teal-light text-teal"
                        : "border-border bg-bg text-text-2 hover:border-teal/30"
                    )}
                  >
                    <span className="block truncate text-[12px] font-medium">
                      {f.originalName}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-text-3">
                      {formatBytes(f.size)}
                    </span>
                  </button>
                ))
              ) : (
                <p className="text-[12px] text-text-3">No stored file found.</p>
              )}
            </div>
            <p className="mt-5 mb-2 text-[11px] font-medium uppercase tracking-wide text-text-3">
              Flags
            </p>
            <button
              type="button"
              onClick={() => setActivePanel("flags")}
              className={cn(
                "w-full rounded-lg border px-2 py-2 text-left transition-colors",
                activePanel === "flags"
                  ? "border-red/35 bg-red-light text-red"
                  : "border-border bg-bg text-text-2 hover:border-red/25"
              )}
            >
              <span className="block text-[12px] font-medium">
                Document flags
              </span>
              <span className="mt-0.5 block text-[10px] text-text-3">
                {flags.length === 0 ? "No flags found" : `${flags.length} flags from analysis`}
              </span>
            </button>
          </aside>

          <div className="min-h-0 bg-bg">
            {activePanel === "flags" ? (
              <div className="h-full overflow-y-auto p-5">
                <div className="mb-4">
                  <p className="text-[15px] font-semibold text-text-1">Flags from this document</p>
                  <p className="mt-1 text-[12px] text-text-3">
                    These flags come from the AI analysis stored with this file.
                  </p>
                </div>
                {flags.length ? (
                  <div className="space-y-3">
                    {flags.map((flag) => (
                      <div key={flag.id} className="rounded-xl border border-border bg-bg-2 p-3 shadow-sm">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-red-light px-2 py-0.5 text-[11px] font-medium text-red">
                            {flag.signalType}
                          </span>
                          <span className="rounded-full bg-bg-3 px-2 py-0.5 text-[11px] text-text-2">
                            {flag.confidence} confidence
                          </span>
                        </div>
                        <p className="text-[13px] font-semibold text-text-1">{flag.description}</p>
                        {flag.sourceAnchor ? (
                          <p className="mt-2 rounded-lg border border-border bg-bg px-2 py-1.5 text-[11px] text-text-3">
                            Source: {flag.sourceAnchor}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-[calc(100%-4rem)] items-center justify-center">
                    <div className="max-w-sm rounded-2xl border border-border bg-bg-2 p-5 text-center">
                      <p className="text-card-title text-text-1">No flags for this document.</p>
                      <p className="mt-2 text-body text-text-2">
                        The analysis did not store any flags for this file.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : file ? (
              previewable ? (
                <iframe
                  key={file.viewUrl}
                  src={file.viewUrl}
                  title={file.originalName}
                  className="h-full w-full border-0"
                />
              ) : (
                <div className="flex h-full items-center justify-center p-8">
                  <div className="max-w-md rounded-2xl border border-border bg-bg-2 p-5 text-center">
                    <p className="text-card-title text-text-1">
                      Preview is not available for this file type.
                    </p>
                    <p className="mt-2 text-body text-text-2">
                      Download the file to view it locally.
                    </p>
                    <a
                      href={file.viewUrl}
                      className="mt-4 inline-flex h-8 items-center rounded-lg bg-teal px-3 text-[13px] font-medium text-primary-foreground"
                    >
                      Download file
                    </a>
                  </div>
                </div>
              )
            ) : (
              <div className="flex h-full items-center justify-center text-body text-text-2">
                No file selected.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TimelineDocumentCard({
  doc,
  dim,
  onDelete,
  onPreview,
}: {
  doc: TimelineDocument;
  dim: boolean;
  onDelete: (d: TimelineDocument, el: HTMLElement | null) => void;
  onPreview: (d: TimelineDocument) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const accent = getCardAccent(doc);
  const a = getAccentClasses(accent);

  return (
    <div
      ref={cardRef}
      role="button"
      tabIndex={0}
      onClick={() => onPreview(doc)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onPreview(doc);
        }
      }}
      className={cn(
        "cursor-pointer rounded-2xl border border-border bg-bg-2 p-3 shadow-sm transition-colors hover:border-teal/30 hover:bg-bg",
        "border-l-[4px]",
        a.border,
        dim && "pointer-events-none opacity-20"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl text-[13px] font-semibold", a.bg, a.text)}>
          {typeLetter(doc)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-text-1">{doc.label}</p>
              <p className="mt-0.5 text-[11px] uppercase tracking-wide text-text-3">
                {typeShort(doc.type)} · {fmtShort(doc.documentDate)}
              </p>
            </div>
            <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium", a.badge)}>
              {doc.flagCount === 0 ? "No flags" : `${doc.flagCount} flags`}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-text-3">
            <span>Received {fmtShort(doc.receivedDate)}</span>
            <span aria-hidden>·</span>
            <span>{doc.language}</span>
            <span aria-hidden>·</span>
            <span>{doc.confidenceLevel}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(doc, cardRef.current);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="shrink-0 rounded-lg border border-border bg-bg px-2 py-1 text-[12px] font-medium text-red hover:border-red/30 hover:bg-red-light"
          aria-label="remove from timeline"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function SortableRow({
  doc,
  onDelete,
  dim,
}: {
  doc: TimelineDocument;
  onDelete: (d: TimelineDocument, el: HTMLElement | null) => void;
  dim: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: doc.id });
  const r = useRef<HTMLDivElement>(null);
  const style = { transform: CSS.Transform.toString(transform), transition };
  const accent = getCardAccent(doc);
  const a = getAccentClasses(accent);
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "w-[64px] rounded-lg border-t-[3px] bg-bg-2 p-0.5 text-center text-[8px] shadow",
        a.border,
        isDragging && "scale-105 border-[1.5px] border-amber/70 opacity-95 shadow-lg",
        dim && "opacity-20"
      )}
    >
      <div className="mx-auto cursor-grab active:cursor-grabbing" ref={r} {...attributes} {...listeners}>
        <p className="line-clamp-2 font-medium text-text-1">{doc.label}</p>
        <p className="text-[7px] text-text-2">{isDragging ? "Moving…" : typeShort(doc.type)}</p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(doc, r.current);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="mt-0.5 text-red"
        >
          ×
        </button>
      </div>
    </div>
  );
}
