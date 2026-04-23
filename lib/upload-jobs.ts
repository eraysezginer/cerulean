import type { CompanyFlagDetail } from "@/data/flags";
import { getFlagsForCompany } from "@/data/flags";
import {
  selectIngestByJobId,
  selectPrimaryHashByJobId,
  updateIngestJobComplete,
  type DocumentIngestRow,
} from "@/lib/db/document-ingest";
import type { PipelineStep } from "@/lib/upload-pipeline-constants";

export type { PipelineStep } from "@/lib/upload-pipeline-constants";
export { PROCESSING_STEPS_PLACEHOLDER } from "@/lib/upload-pipeline-constants";

export type UploadJob = {
  companyId: string;
  fileName: string;
  fileSize: number;
  hash: string;
  documentId: string;
  startTime: number;
  updateLabel: string;
  documentDate: string;
  documentTypeName: string;
  temporalType: "in-sequence" | "historical" | "reference";
  processingSeconds: number;
  flags: CompanyFlagDetail[];
  suppressFlags: boolean;
};

const jobPolls = new Map<string, number>();

function toBool(v: number | boolean): boolean {
  return v === true || v === 1;
}

function buildMockFlags(companyId: string, fileName: string): CompanyFlagDetail[] {
  const base = getFlagsForCompany(companyId).slice(0, 2);
  if (base.length === 0) {
    return [
      {
        id: `up-${Date.now()}-1`,
        confidence: "High",
        signalType: "Narrative density",
        description:
          "Compared to the stored baseline, disclosure depth in this document differs in several sections.",
        sourceAnchor: fileName,
      },
    ];
  }
  return base.map((f, i) => ({
    ...f,
    id: `upload-${companyId}-${Date.now()}-${i}`,
    sourceAnchor: fileName,
  }));
}

function rowToUploadJob(row: DocumentIngestRow, flags: CompanyFlagDetail[]): UploadJob {
  return {
    companyId: row.companyId,
    fileName: row.fileDisplayName,
    fileSize: row.totalSizeBytes,
    hash: row.primaryHash,
    documentId: row.documentId,
    startTime: row.jobStartedAt.getTime(),
    updateLabel: row.updateLabel,
    documentDate: row.documentDate,
    documentTypeName: row.documentTypeName,
    temporalType: row.temporalType as UploadJob["temporalType"],
    processingSeconds: row.processingSeconds ?? 0,
    flags,
    suppressFlags: toBool(row.suppressFlags),
  };
}

export async function getJobView(jobId: string): Promise<{
  job: UploadJob;
  state: "processing" | "complete";
  steps: PipelineStep[];
  flagsGenerated: number;
} | null> {
  let row = await selectIngestByJobId(jobId);
  if (!row) return null;

  const elapsed = (Date.now() - row.jobStartedAt.getTime()) / 1000;
  const polls = (jobPolls.get(jobId) ?? 0) + 1;
  jobPolls.set(jobId, polls);
  const simulatedComplete = elapsed > 5 || polls >= 4;

  if (simulatedComplete && row.status === "processing") {
    let flags: CompanyFlagDetail[] = [];
    if (!toBool(row.suppressFlags)) {
      flags = buildMockFlags(row.companyId, row.fileDisplayName);
    }
    await updateIngestJobComplete(
      jobId,
      Math.max(1, Math.round(elapsed)),
      flags.length ? JSON.stringify(flags) : null
    );
    const updated = await selectIngestByJobId(jobId);
    if (updated) {
      row = updated;
    }
  }

  const flags: CompanyFlagDetail[] = row.flagsJson
    ? (JSON.parse(row.flagsJson) as CompanyFlagDetail[])
    : [];
  const done = row.status === "complete";

  const stepTemplate: PipelineStep[] = done
    ? [
        {
          id: "ingest",
          name: "Ingestion",
          status: "complete",
          description: "File stored and hash verified for the audit log.",
        },
        {
          id: "classify",
          name: "Classification",
          status: "complete",
          description: "Document type applied to the processing chain.",
        },
        {
          id: "baseline",
          name: "Baseline comparison",
          status: "complete",
          description: "Completed against the rolling and founding baselines.",
        },
        {
          id: "forensic",
          name: "Forensic analysis",
          status: "complete",
          description: "Omission and language signals evaluated.",
        },
        {
          id: "xref",
          name: "External cross-reference",
          status: "complete",
          description: "Named entities and metrics resolved against known sources.",
        },
      ]
    : [
        {
          id: "ingest",
          name: "Ingestion",
          status: "complete",
          description: "File stored and hash verified for the audit log.",
        },
        {
          id: "classify",
          name: "Classification",
          status: "complete",
          description: "Document type applied to the processing chain.",
        },
        {
          id: "baseline",
          name: "Baseline comparison",
          status: "processing",
          description: "Comparing to stored investor updates and stored claims.",
        },
        {
          id: "forensic",
          name: "Forensic analysis",
          status: "queued",
          description: "Waiting in the analysis queue.",
        },
        {
          id: "xref",
          name: "External cross-reference",
          status: "queued",
          description: "Preparing to match claims and public records.",
        },
      ];

  const job = rowToUploadJob(row, flags);
  const steps: PipelineStep[] =
    job.suppressFlags && done
      ? stepTemplate.map((s, i) =>
          i < 2
            ? s
            : {
                ...s,
                status: "complete" as const,
                description: "Skipped — output suppressed for this document.",
              }
        )
      : stepTemplate;

  return {
    job,
    state: done ? "complete" : "processing",
    steps,
    flagsGenerated: job.suppressFlags ? 0 : flags.length,
  };
}

export async function getJobHash(jobId: string): Promise<string | null> {
  return selectPrimaryHashByJobId(jobId);
}
