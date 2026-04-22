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
import { motion, useSpring } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import type { TimelineDocument, TimelineType } from "@/data/timeline";
import { getAccentClasses, getCardAccent, typeLetter } from "@/lib/timeline-ui";
import { cn } from "@/lib/utils";

const QUARTERS = [
  { label: "Q2 2024", p: 0.08 },
  { label: "Q3 2024", p: 0.28 },
  { label: "Q4 2024", p: 0.45 },
  { label: "Q1 2025", p: 0.62 },
  { label: "Q4 2025", p: 0.9 },
] as const;

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

function fmtTipMonthYear(d: string): string {
  const x = new Date(d + (d.length <= 10 ? "T12:00:00" : ""));
  if (Number.isNaN(x.getTime())) return d;
  return x.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

type Tier = "h" | "n" | "d";

function tierSizes(tier: Tier) {
  if (tier === "h") return { w: 120, h: 148, stem: 52, topBorder: 4 };
  if (tier === "n") return { w: 78, h: 98, stem: 38, topBorder: 3 };
  return { w: 64, h: 80, stem: 28, topBorder: 3 };
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
  const [clientX, setClientX] = useState<number | null>(null);
  const [hoverI, setHoverI] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TimelineDocument | null>(null);
  const [deletePos, setDeletePos] = useState<{ top: number; left: number } | null>(null);
  const [toast, setToast] = useState<"ok" | "err" | null>(null);
  const [activeDrag, setActiveDrag] = useState<TimelineDocument | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

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

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (reorder) return;
      const t = trackRef.current;
      if (!t) return;
      const r = t.getBoundingClientRect();
      setClientX(e.clientX - r.left + t.scrollLeft);
    },
    [reorder]
  );

  const onMouseLeave = useCallback(() => {
    setClientX(null);
    setHoverI(null);
  }, []);

  useLayoutEffect(() => {
    if (reorder) {
      setHoverI(null);
      return;
    }
    if (clientX == null || !docs?.length) {
      setHoverI(null);
      return;
    }
    const t = trackRef.current;
    if (!t) return;
    const W = t.scrollWidth;
    const n = docs.length;
    const slot = W / n;
    let best = 0;
    let bestD = Number.POSITIVE_INFINITY;
    for (let i = 0; i < n; i++) {
      const d = Math.abs(clientX - (i + 0.5) * slot);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    setHoverI(bestD < 72 ? best : null);
  }, [clientX, docs, reorder]);

  const tierOf = useCallback(
    (i: number): Tier => {
      if (reorder) return "d";
      if (hoverI == null) return "d";
      if (i === hoverI) return "h";
      if (i === hoverI - 1 || i === hoverI + 1) return "n";
      return "d";
    },
    [hoverI, reorder]
  );

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
  const trackW = Math.max(1400, n * 100);

  return (
    <div
      className="relative min-h-0 flex-1 bg-bg p-6"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
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
          className="mb-3 flex w-full items-center justify-center py-1.5 text-[11px] text-teal"
          style={{ minHeight: 26, backgroundColor: "rgba(11, 114, 117, 0.04)" }}
        >
          {stats.n} documents · {stats.inv} investor updates · {stats.ref} reference documents · {stats.flags}{" "}
          active flags · Hover to expand · Drag to reorder · × to remove
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
        <div className="overflow-x-auto pb-4">
          <div
            ref={trackRef}
            className="relative select-none"
            style={{ minWidth: trackW, height: 300, margin: "0 12px" }}
          >
            <div
              className="pointer-events-none absolute left-0 h-2.5 w-2.5 -translate-y-1/2 rounded-full border-2 border-white"
              style={{ top: 150, background: "#0B7275" }}
            />
            <div
              className="pointer-events-none absolute right-0 h-2.5 w-2.5 -translate-y-1/2 rounded-full border-2 border-white"
              style={{ top: 150, background: "#0B7275" }}
            />
            <div
              className="absolute right-0 left-0 h-0.5"
              style={{ top: 150, backgroundColor: "#0B7275" }}
            />
            {QUARTERS.map((q) => (
              <div
                key={q.label}
                className="pointer-events-none absolute flex flex-col items-center"
                style={{ left: `${q.p * 100}%`, top: 150, transform: "translateX(-50%)" }}
              >
                <div className="h-2 w-px" style={{ backgroundColor: "rgba(11, 114, 117, 0.45)" }} />
                <span className="mt-1.5 text-[11px] text-text-3">{q.label}</span>
              </div>
            ))}

            {docs.map((d, i) => {
              const above = i % 2 === 0;
              return (
                <div
                  key={d.id}
                  className="absolute top-0 bottom-0 w-0"
                  style={{ left: `${((i + 0.5) / n) * 100}%` }}
                >
                  <div className="relative h-full w-[200px] -translate-x-1/2">
                    <StackCard
                      doc={d}
                      above={above}
                      tier={tierOf(i)}
                      dim={deleteTarget?.id === d.id}
                      onDelete={openDelete}
                    />
                  </div>
                </div>
              );
            })}
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

    </div>
  );
}

function StackCard({
  doc,
  above,
  tier,
  dim,
  onDelete,
}: {
  doc: TimelineDocument;
  above: boolean;
  tier: Tier;
  dim: boolean;
  onDelete: (d: TimelineDocument, el: HTMLElement | null) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const accent = getCardAccent(doc);
  const a = getAccentClasses(accent);
  const hex = DOT_HEX[accent];
  const sz = tierSizes(tier);
  const springW = useSpring(sz.w, { stiffness: 380, damping: 32 });
  const springH = useSpring(sz.h, { stiffness: 380, damping: 32 });
  const springStem = useSpring(sz.stem, { stiffness: 380, damping: 32 });

  useLayoutEffect(() => {
    springW.set(sz.w);
    springH.set(sz.h);
    springStem.set(sz.stem);
  }, [sz.w, sz.h, sz.stem, springH, springStem, springW]);

  const origin = above ? "bottom" : "top";

  const cardInner = (
    <motion.div
      ref={cardRef}
      style={{ width: springW, height: springH, transformOrigin: `${origin} center` }}
      className={cn(
        "overflow-hidden rounded-lg border border-border border-t-0 bg-bg-2",
        tier === "h" && "bg-bg shadow-md",
        dim && "pointer-events-none opacity-20"
      )}
    >
      <div
        className="relative box-border h-full w-full p-0.5"
        style={{ borderTop: `${sz.topBorder}px solid ${hex}`, borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(doc, cardRef.current);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute left-0.5 top-0.5 z-10 flex h-3.5 w-3.5 items-center justify-center rounded"
          style={{ backgroundColor: "rgba(204, 34, 34, 0.08)" }}
          aria-label="remove from timeline"
        >
          <span className="text-[8px] leading-none text-red">×</span>
        </button>
        {doc.flagCount > 0 && (
          <span className={cn("absolute right-0.5 top-0.5 z-10 text-[8px] font-medium", a.badge)}>
            {doc.flagCount}⚑
          </span>
        )}
        <div
          className={cn("mx-auto mt-2.5 flex h-5 w-5 items-center justify-center rounded text-[11px] font-semibold", a.bg, a.text)}
        >
          {typeLetter(doc)}
        </div>
        <p className={cn("mt-0.5 text-center text-[11px] font-semibold", a.text)}>{doc.label}</p>
        <p className="text-center text-[9px] text-text-3">{fmtShort(doc.documentDate)}</p>
        <p className="line-clamp-1 text-center text-[8px] text-text-2">{typeShort(doc.type)}</p>
        {tier === "h" && (
          <>
            <div className="mx-1 my-0.5 border-t border-border" />
            <p className="text-center text-[9px] font-semibold text-text-1">
              {doc.flagCount === 0 ? "No flags" : `${doc.flagCount} flags · in portfolio record`}
            </p>
            <div className="mt-0.5 flex justify-center gap-2 text-[8px]">
              <button
                type="button"
                className="text-red"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(doc, cardRef.current);
                }}
                onPointerDown={(e) => e.stopPropagation()}
              >
                ✕ Del
              </button>
              <span className="text-teal">⇄ Mv</span>
            </div>
          </>
        )}
        <div className="absolute bottom-0.5 left-0 right-0 text-center text-[9px] text-text-3">⋮⋮</div>
      </div>
    </motion.div>
  );

  const stem = (
    <motion.div
      className="w-px shrink-0"
      style={{ height: springStem, backgroundColor: `${hex}80` }}
    />
  );

  const dot = <div className="h-3 w-3 shrink-0 rounded-full border-2 border-white" style={{ background: hex }} />;

  const tooltip =
    tier === "h" ? (
      <div className="mb-1 whitespace-nowrap rounded-md bg-text-1 px-1.5 py-0.5 text-[9px] text-bg">
        {fmtTipMonthYear(doc.documentDate)} · {doc.flagCount} flags · {doc.confidenceLevel}
      </div>
    ) : null;

  if (above) {
    return (
      <div className="pointer-events-auto relative h-[300px] w-full">
        <div className="absolute left-1/2 h-[150px] w-44 -translate-x-1/2">
          <div className="flex h-full flex-col items-center justify-end pb-0">
            {tooltip}
            {cardInner}
            {stem}
            <div className="-mb-[5px]">{dot}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pointer-events-auto relative h-[300px] w-full">
      <div className="absolute left-1/2 top-[150px] h-[150px] w-44 -translate-x-1/2">
        <div className="flex h-full flex-col items-center">
          <div className="-mt-[5px]">{dot}</div>
          {stem}
          {tooltip}
          {cardInner}
        </div>
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
