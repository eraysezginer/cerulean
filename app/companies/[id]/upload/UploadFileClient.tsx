"use client";

import { useCallback, useEffect, useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart2,
  BookOpen,
  FileStack,
  FileText,
  LayoutGrid,
  Presentation,
  Scale,
  Upload,
  Users,
} from "lucide-react";

import { FlagCard } from "@/components/cerulean/FlagCard";
import { ChipGroup } from "@/components/cerulean/ChipGroup";
import {
  FormField,
  SelectDropdown,
  TaggedTextarea,
  TwoColumnRow,
} from "@/components/add-company/ui";
import { Button } from "@/components/ui/button";
import { CheckboxShad } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { PipelineStep } from "@/lib/upload-jobs";
import { PROCESSING_STEPS_PLACEHOLDER } from "@/lib/upload-jobs";
import type { CompanyRow } from "@/data/company-types";
import type { CompanyFlagDetail } from "@/data/flags";
import { getFounderEmailsForCompany } from "@/lib/founder-emails";

const ACCEPT = ".pdf,.eml,.msg,.txt,.docx,.xlsx";
const PICKER_ACCEPT = `${ACCEPT},application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`;

type DocId =
  | "investor"
  | "ppm"
  | "financial"
  | "captable"
  | "pitch"
  | "board"
  | "side"
  | "reference";

type DocRow = {
  id: DocId;
  name: string;
  description: string;
  color: "teal" | "purple" | "amber" | "green" | "red" | "gold" | "text-3" | "border";
  Icon: React.ComponentType<{ className?: string }>;
};

const DOC_TYPES: DocRow[] = [
  {
    id: "investor",
    name: "Investor update",
    description: "Full forensic pipeline",
    color: "teal",
    Icon: FileText,
  },
  {
    id: "ppm",
    name: "PPM / Offering doc",
    description: "Contradiction vs. prior updates",
    color: "purple",
    Icon: Scale,
  },
  {
    id: "financial",
    name: "Financial statement",
    description: "Open-banking cross-reference",
    color: "amber",
    Icon: BarChart2,
  },
  {
    id: "captable",
    name: "Cap table snapshot",
    description: "Carta cross-reference",
    color: "green",
    Icon: Users,
  },
  {
    id: "pitch",
    name: "Pitch deck",
    description: "Named-claims verification",
    color: "gold",
    Icon: Presentation,
  },
  {
    id: "board",
    name: "Board deck",
    description: "Full forensic pipeline",
    color: "red",
    Icon: LayoutGrid,
  },
  {
    id: "side",
    name: "Side letter",
    description: "Reference storage, investor rights",
    color: "text-3",
    Icon: FileStack,
  },
  {
    id: "reference",
    name: "Reference document",
    description: "Storage only, no temporal position",
    color: "border",
    Icon: BookOpen,
  },
];

function defaultTemporalForDoc(id: DocId): "in-sequence" | "historical" | "reference" {
  if (id === "investor") return "in-sequence";
  if (id === "ppm" || id === "financial" || id === "captable") return "reference";
  return "historical";
}

function topBorder(c: DocRow["color"]): string {
  return {
    teal: "border-t-teal bg-teal/[0.06]",
    purple: "border-t-purple bg-purple/[0.06]",
    amber: "border-t-amber bg-amber/[0.06]",
    green: "border-t-green bg-green/[0.06]",
    red: "border-t-red bg-red/[0.06]",
    gold: "border-t-gold bg-gold/[0.06]",
    "text-3": "border-t-text-3 bg-text-3/10",
    border: "border-t-border bg-border/30",
  }[c];
}

function sequenceDisplay(t: "in-sequence" | "historical" | "reference"): string {
  if (t === "in-sequence") return "In sequence";
  if (t === "historical") return "Historical";
  return "Reference document";
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

type JobResponse = {
  status: "processing" | "complete";
  steps: PipelineStep[];
  flagsGenerated: number;
  eta: string;
  fileName: string;
  fileSize: number;
  hash: string;
  updateLabel: string;
  documentDate: string;
  documentTypeName: string;
  temporalType: "in-sequence" | "historical" | "reference";
  processingSeconds: number;
  flags?: CompanyFlagDetail[];
};

type IngestMeta = {
  jobId: string;
  hash: string;
  fileName: string;
  fileSize: number;
};

export function UploadFileClient({ company }: { company: CompanyRow }) {
  const router = useRouter();
  const inputId = useId();
  const [phase, setPhase] = useState<"form" | "processing" | "complete">("form");
  const [files, setFiles] = useState<File[]>([]);
  const [docType, setDocType] = useState<DocId>("investor");
  const [userSetTemporal, setUserSetTemporal] = useState(false);
  const [temporal, setTemporal] = useState<"in-sequence" | "historical" | "reference">("in-sequence");
  const [updateLabel, setUpdateLabel] = useState("");
  const [documentDate, setDocumentDate] = useState("");
  const [receivedDate, setReceivedDate] = useState("");
  const [language, setLanguage] = useState("English");
  const [sender, setSender] = useState(getFounderEmailsForCompany(company.id)[0] ?? "");
  const [howReceived, setHowReceived] = useState("Email attachment");
  const [provenance, setProvenance] = useState("Original — directly from founder");
  const [contextNote, setContextNote] = useState("");
  const [optForensic, setOptForensic] = useState(true);
  const [optExternal, setOptExternal] = useState(true);
  const [optDigest, setOptDigest] = useState(true);
  const [optSuppress, setOptSuppress] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [ingest, setIngest] = useState<IngestMeta | null>(null);
  const [polled, setPolled] = useState<JobResponse | null>(null);

  const resetTemporalFromDoc = useCallback((id: DocId) => {
    setTemporal(defaultTemporalForDoc(id));
  }, []);

  useEffect(() => {
    if (!userSetTemporal) {
      resetTemporalFromDoc(docType);
    }
  }, [docType, userSetTemporal, resetTemporalFromDoc]);

  const onPick = (list: FileList | null) => {
    if (!list?.length) return;
    setFiles((prev) => {
      const next = new Map<string, File>();
      prev.forEach((f) => next.set(f.name + f.size, f));
      Array.from(list).forEach((f) => next.set(f.name + f.size, f));
      return Array.from(next.values());
    });
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onPick(e.dataTransfer.files);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (files.length === 0) {
      setSubmitError("Add at least one file in a supported format.");
      return;
    }
    const totalSize = files.reduce((a, f) => a + f.size, 0);
    const fileListLabel = files.length === 1 ? files[0].name : `${files[0].name} + ${files.length - 1} more`;
    const fd = new FormData();
    files.forEach((f) => fd.append("file", f));
    fd.append("companyName", company.name);
    fd.append("documentTypeName", DOC_TYPES.find((d) => d.id === docType)?.name ?? "Investor update");
    fd.append("temporalType", temporal);
    fd.append("updateLabel", updateLabel);
    fd.append("documentDate", documentDate);
    fd.append("receivedDate", receivedDate);
    fd.append("language", language);
    fd.append("originalSender", sender);
    fd.append("howReceived", howReceived);
    fd.append("provenance", provenance);
    fd.append("contextNote", contextNote);
    fd.append("optForensic", String(optForensic));
    fd.append("optExternal", String(optExternal));
    fd.append("optDigest", String(optDigest));
    fd.append("suppressFlags", String(optSuppress));

    const res = await fetch(`/api/companies/${company.id}/documents`, {
      method: "POST",
      body: fd,
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setSubmitError((j as { error?: string }).error ?? "Ingestion could not be started.");
      return;
    }
    const data = (await res.json()) as { jobId: string; hash: string };
    setIngest({
      jobId: data.jobId,
      hash: data.hash,
      fileName: fileListLabel,
      fileSize: totalSize,
    });
    setPolled(null);
    setPhase("processing");
  };

  useEffect(() => {
    if (phase !== "processing" || !ingest) return;
    let cancelled = false;
    const tick = async () => {
      const res = await fetch(`/api/jobs/${ingest.jobId}`);
      if (!res.ok || cancelled) return;
      const j = (await res.json()) as JobResponse;
      setPolled(j);
      if (j.status === "complete") {
        setPhase("complete");
      }
    };
    void tick();
    const id = setInterval(() => {
      void tick();
    }, 3000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [phase, ingest]);

  const resetForm = () => {
    setPhase("form");
    setIngest(null);
    setPolled(null);
  };

  if (phase === "processing" && ingest) {
    const steps = polled?.steps ?? PROCESSING_STEPS_PLACEHOLDER;
    const hash = polled?.hash ?? ingest.hash;
    return (
      <div className="p-8">
        <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-[14px] text-text-2">
          <Link href="/companies" className="hover:text-text-1">
            Portfolio
          </Link>
          <span className="text-text-3">›</span>
          <Link href={`/companies/${company.id}/flags`} className="hover:text-text-1">
            {company.name}
          </Link>
          <span className="text-text-3">›</span>
          <span className="text-text-1">Upload file</span>
        </nav>

        <div className="mt-2 space-y-3">
          <div className="rounded-lg border border-border bg-bg-2 p-3 border-l-[3px] border-l-teal">
            <p className="text-[14px] font-mono text-text-2">
              <span className="text-[18px] leading-none">📄</span> {ingest.fileName} · {formatBytes(ingest.fileSize)} ·
              SHA-256: {hash.slice(0, 18)}…
            </p>
            <span className="mt-1 inline-block rounded bg-green-light px-1.5 py-0.5 text-[13px] font-medium text-green">
              ✓ Hashed
            </span>
          </div>

          {steps.map((s) => {
            const dot =
              s.status === "complete" ? "bg-green" : s.status === "processing" ? "bg-teal animate-pulse" : "bg-text-3/40";
            const badge =
              s.status === "complete" ? (
                <span className="shrink-0 text-[13px] font-medium text-green">Complete</span>
              ) : s.status === "processing" ? (
                <span className="shrink-0 text-[13px] font-medium text-teal">Processing…</span>
              ) : (
                <span className="shrink-0 text-[13px] text-text-3">Queued</span>
              );
            return (
              <div
                key={s.id}
                className="flex min-h-[42px] items-center gap-2 rounded-lg border border-border bg-bg-2 px-2 py-1"
              >
                <span className={cn("h-2 w-2 shrink-0 rounded-full", dot)} />
                <span className="min-w-0 flex-1 text-[15px] font-medium text-text-1">{s.name}</span>
                {badge}
                <span className="max-w-[min(45%,20rem)] shrink text-right text-[13px] text-text-3 sm:max-w-[50%]">
                  {s.description}
                </span>
              </div>
            );
          })}

          <div className="w-full rounded-lg bg-teal/[0.05] px-3 py-2 text-center text-[14px] text-teal">
            Estimated completion: {polled?.eta ?? "45 seconds"} · You will be notified when flags are ready
          </div>
        </div>
      </div>
    );
  }

  if (phase === "complete" && ingest && polled?.status === "complete") {
    const j = polled;
    const list = j.flags ?? [];
    return (
      <div className="p-8">
        <nav className="mb-2 flex flex-wrap items-center gap-1.5 text-[14px] text-text-2">
          <Link href="/companies" className="hover:text-text-1">
            Portfolio
          </Link>
          <span className="text-text-3">›</span>
          <Link href={`/companies/${company.id}/flags`} className="hover:text-text-1">
            {company.name}
          </Link>
          <span className="text-text-3">›</span>
          <span className="text-text-1">Upload file</span>
        </nav>
        <h1 className="text-[22px] font-semibold leading-tight text-green">Analysis complete</h1>
        <div className="mt-4 rounded-lg border border-border bg-green/[0.06] p-4 border-l-[3px] border-l-green">
          <p className="text-[16px] leading-normal text-text-1">📄 {j.fileName}</p>
          <p className="mt-1 text-[15px] text-text-2">
            {j.updateLabel || "—"} · {j.documentTypeName} · {j.documentDate || "—"} · sha256:{j.hash.slice(0, 18)}…
          </p>
          <p className="mt-1 text-[14px] text-text-3">
            Baseline: {sequenceDisplay(j.temporalType)} · Processing: {j.processingSeconds}s
          </p>
        </div>

        <p className="mb-3 mt-6 text-[13px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-text-3">
          FLAGS GENERATED FROM THIS DOCUMENT
        </p>
        {list.length === 0 ? (
          <div className="rounded-lg border border-border bg-green-light p-4 text-[16px] text-green">
            No flags generated. Document added to baseline successfully.
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((f) => (
              <FlagCard key={f.id} flag={f} />
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            onClick={resetForm}
            className="h-[36px] rounded-md border-0 bg-bg-3 text-[17px] font-medium text-text-2 hover:bg-bg-3/90"
          >
            Upload another file
          </Button>
          <Link
            href={`/companies/${company.id}/flags`}
            className="inline-flex h-[36px] items-center rounded-lg bg-teal px-4 text-[17px] font-medium text-primary-foreground"
          >
            View all flags for {company.name} →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="p-8">
      <nav className="mb-2 flex flex-wrap items-center gap-1.5 text-[14px] text-text-2">
        <Link href="/companies" className="hover:text-text-1">
          Portfolio
        </Link>
        <span className="text-text-3">›</span>
        <Link href={`/companies/${company.id}/flags`} className="hover:text-text-1">
          {company.name}
        </Link>
        <span className="text-text-3">›</span>
        <span className="text-text-1">Upload file</span>
      </nav>

      <h1 className="text-[22px] font-semibold leading-tight text-text-1">Upload file</h1>
      <p className="mt-1 text-[16px] leading-normal text-text-2">
        Add an investor update or document to the monitoring corpus manually.
      </p>

      {submitError ? <p className="mt-2 text-[15px] text-red">{submitError}</p> : null}

      <section className="mt-8">
        <p
          className="flex h-24 flex-col items-center justify-center rounded-lg border-2 border-dashed border-teal/[0.35] bg-teal/[0.03] px-3"
          onDragEnter={(e) => e.preventDefault()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
        >
          <input
            id={inputId}
            type="file"
            multiple
            accept={PICKER_ACCEPT}
            className="sr-only"
            onChange={(e) => onPick(e.target.files)}
          />
          <label htmlFor={inputId} className="flex cursor-pointer flex-col items-center text-center">
            <Upload className="mb-1 h-6 w-6 text-teal" />
            <span className="text-[14px] font-medium text-teal">Drag here, or the file picker below</span>
            <span className="mt-0.5 text-[12px] text-text-3">.pdf .eml .msg .txt .docx .xlsx (multiple files)</span>
          </label>
        </p>
        <p className="mt-2 inline-block max-w-2xl rounded-full bg-bg-3 px-2.5 py-1 text-[11px] text-text-3">
          Every file is SHA-256 hashed at ingestion before any analysis. The hash is logged to the immutable audit
          record.
        </p>
        {files.length > 0 ? (
          <ul className="mt-2 text-[14px] text-text-2">
            {files.map((f) => (
              <li key={f.name + f.size}>
                {f.name} — {formatBytes(f.size)}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="mt-8">
        <h2 className="text-[13px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-text-3">Document classification</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {DOC_TYPES.map((d) => {
            const active = docType === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setDocType(d.id)}
                className={cn(
                  "flex h-[60px] flex-col border-t-[3px] p-2 text-left transition-colors",
                  active ? topBorder(d.color) : "border-t-transparent bg-bg-2"
                )}
              >
                <div className="flex w-full min-w-0 items-start gap-1.5">
                  <d.Icon className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
                  <span className="min-w-0 flex-1 text-left text-[13px] font-semibold leading-tight text-text-1 line-clamp-1">
                    {d.name}
                  </span>
                </div>
                <p className="mt-0.5 w-full min-w-0 text-left text-[11px] leading-tight text-text-3 line-clamp-1">
                  {d.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-[13px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-text-3">Document identity</h2>
        <div className="mt-2 space-y-3">
          <TwoColumnRow>
            <FormField
              size="lg"
              label="Update number or label"
              hint="— sets temporal position"
              value={updateLabel}
              onChange={setUpdateLabel}
              placeholder="Update 7 · Q3 2024 · October investor letter"
            />
            <FormField
              size="lg"
              label="Document date"
              value={documentDate}
              onChange={setDocumentDate}
              placeholder="MM/DD/YYYY (date the file was created or sent)"
            />
          </TwoColumnRow>
          <TwoColumnRow>
            <FormField
              size="lg"
              label="Received date"
              value={receivedDate}
              onChange={setReceivedDate}
              placeholder="MM/DD/YYYY (date received in your system)"
            />
            <SelectDropdown
              size="lg"
              label="Language"
              hint="— route for the NLP pipeline"
              value={language}
              onChange={setLanguage}
              options={["English", "Turkish", "French", "German", "Spanish", "Mandarin", "Arabic", "Other"].map(
                (o) => ({ value: o, label: o })
              )}
            />
          </TwoColumnRow>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-[13px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-text-3">Temporal sequence</h2>
        <p className="mt-1 text-[15px] font-medium text-text-1">How this document is treated in the monitoring sequence</p>
        <div className="mt-2 space-y-2">
          {(
            [
              {
                v: "in-sequence" as const,
                title: "In sequence — in the active baseline",
                d: "Standard investor update. In the rolling baseline and compared to the founding baseline.",
              },
              {
                v: "historical" as const,
                title: "Historical — founding baseline only",
                d: "Pre-monitoring archive. Establishes the founding baseline; not an active update.",
              },
              {
                v: "reference" as const,
                title: "Reference — cross-check only, outside the sequence",
                d: "PPM, financials, or deck. Ground truth for contradiction checks. No temporal position.",
              },
            ] as const
          ).map((row) => (
            <label
              key={row.v}
              className={cn(
                "flex cursor-pointer gap-2 rounded-md border border-border bg-bg-2 p-2",
                temporal === row.v && "ring-1 ring-teal/30"
              )}
            >
              <input
                type="radio"
                className="mt-1"
                checked={temporal === row.v}
                onChange={() => {
                  setUserSetTemporal(true);
                  setTemporal(row.v);
                }}
              />
              <span>
                <span className="text-[15px] font-medium text-text-1">{row.title}</span>
                <span className="mt-0.5 block text-[14px] text-text-2">{row.d}</span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-[13px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-text-3">Provenance</h2>
        <div className="mt-2 space-y-3">
          <TwoColumnRow>
            <FormField
              size="lg"
              label="Original sender email"
              hint="— from registered founder addresses"
              value={sender}
              onChange={setSender}
              placeholder="ceo@company.com"
            />
            <SelectDropdown
              size="lg"
              label="How this was received"
              value={howReceived}
              onChange={setHowReceived}
              options={[
                { value: "Email attachment", label: "Email attachment" },
                { value: "Shared link (Drive/Notion/etc)", label: "Shared link (Drive/Notion/etc)" },
                { value: "Downloaded from portal", label: "Downloaded from portal" },
                { value: "Forwarded by third party", label: "Forwarded by third party" },
                { value: "Manual entry / other", label: "Manual entry / other" },
              ]}
            />
          </TwoColumnRow>
        </div>
        <div className="mt-3">
          <ChipGroup
            size="lg"
            label="Document provenance"
            hint="— in the chain-of-custody record"
            options={[
              "Original — directly from founder",
              "Forwarded — via third party",
              "Downloaded attachment",
              "Shared link",
              "Internal copy — annotated or edited",
            ]}
            value={provenance}
            onChange={setProvenance}
          />
        </div>
      </section>

      <section className="mt-6">
        <TaggedTextarea
          size="lg"
          label="Context note (optional)"
          tag="Context"
          tagColor="purple"
          rows={3}
          placeholder="e.g. 'This version arrived 12 days late. Tone differs from prior updates.'"
          value={contextNote}
          onChange={setContextNote}
        />
        <p className="mt-0.5 text-[13px] text-text-3">Tagged to My Notes · private · not shown to the founder</p>
      </section>

      <section className="mt-6 space-y-2">
        <h2 className="text-[13px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-text-3">Processing at ingestion</h2>
        <RowCheck
          id="c1"
          checked={optForensic}
          onChange={setOptForensic}
          label="Run full forensic analysis immediately after upload"
          sub="Omission, contradiction, milestone drift, behavioral — all on"
        />
        <RowCheck
          id="c2"
          checked={optExternal}
          onChange={setOptExternal}
          label="Add to external-signal cross-reference"
          sub="Named entities, claims, and metrics for cross-reference"
        />
        <RowCheck
          id="c3"
          checked={optDigest}
          onChange={setOptDigest}
          label="Include in the next Monday digest"
          sub="Flags from this file in the scheduled digest"
        />
        <RowCheck
          id="c4"
          checked={optSuppress}
          onChange={setOptSuppress}
          label="Suppress flags from this file"
          sub="Stored for reference. For known clean files."
        />
        {optSuppress ? (
          <p className="ml-6 rounded border border-amber/40 bg-amber-light px-2 py-1.5 text-[14px] text-amber">
            Suppressed files are kept but do not create flags. Use only for known clean documents.
          </p>
        ) : null}
      </section>

      <div className="mt-8 flex items-center justify-between border-t border-border/80 pt-6">
        <Button
          type="button"
          onClick={() => router.push(`/companies/${company.id}/flags`)}
          className="h-[36px] w-[92px] rounded-md border-0 bg-bg-3 text-[17px] font-medium text-text-2 hover:bg-bg-3/90"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="h-[36px] gap-1 rounded-lg bg-teal px-4 text-[17px] font-medium text-primary-foreground"
        >
          Upload & begin analysis →
        </Button>
      </div>
    </form>
  );
}

function RowCheck({
  id,
  checked,
  onChange,
  label,
  sub,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  sub: string;
}) {
  return (
    <div className="flex gap-2">
      <CheckboxShad id={id} checked={checked} onCheckedChange={onChange} className="mt-0.5 h-5 w-5 [&_svg]:h-3 [&_svg]:w-3" />
      <div>
        <label htmlFor={id} className="text-[15px] text-text-1">
          {label}
        </label>
        <p className="text-[14px] text-text-2">{sub}</p>
      </div>
    </div>
  );
}
