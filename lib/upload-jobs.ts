import type { CompanyFlagDetail } from "@/data/flags";
import { getFlagsForCompany } from "@/data/flags";

export type UploadJobStatus = "processing" | "complete";

export type PipelineStep = {
  id: string;
  name: string;
  status: "complete" | "processing" | "queued";
  description: string;
};

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

const jobs = new Map<string, UploadJob>();
const firstPoll = new Map<string, number>();

export function createJob(
  data: Omit<UploadJob, "startTime" | "flags" | "processingSeconds"> & {
    companyId: string;
  }
): { jobId: string; job: UploadJob } {
  const jobId = `job-${data.companyId}-${Date.now()}`;
  const job: UploadJob = {
    ...data,
    startTime: Date.now(),
    flags: [],
    processingSeconds: 0,
  };
  jobs.set(jobId, job);
  firstPoll.set(jobId, 0);
  return { jobId, job };
}

/** Shown in the client before the first /api/jobs poll returns. */
export const PROCESSING_STEPS_PLACEHOLDER: PipelineStep[] = [
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

function buildMockFlags(companyId: string, fileName: string): CompanyFlagDetail[] {
  const base = getFlagsForCompany(companyId).slice(0, 2);
  if (base.length === 0) {
    return [
      {
        id: `up-${Date.now()}-1`,
        confidence: "High",
        signalType: "Narrative density",
        description: "Compared to the stored baseline, disclosure depth in this document differs in several sections.",
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

export function getJobView(jobId: string): {
  job: UploadJob;
  state: "processing" | "complete";
  steps: PipelineStep[];
  flagsGenerated: number;
} | null {
  const job = jobs.get(jobId);
  if (!job) return null;
  const elapsed = (Date.now() - job.startTime) / 1000;
  const polls = (firstPoll.get(jobId) ?? 0) + 1;
  firstPoll.set(jobId, polls);

  const isComplete = elapsed > 5 || polls >= 4;

  const stepTemplate: PipelineStep[] = isComplete
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

  if (isComplete && !job.flags.length && !job.suppressFlags) {
    job.flags = buildMockFlags(job.companyId, job.fileName);
  }
  if (isComplete) {
    job.processingSeconds = Math.max(1, Math.round(elapsed));
  }

  const steps: PipelineStep[] =
    job.suppressFlags && isComplete
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
    state: isComplete ? "complete" : "processing",
    steps,
    flagsGenerated: job.suppressFlags ? 0 : job.flags.length,
  };
}

export function getJobHash(jobId: string): string | null {
  return jobs.get(jobId)?.hash ?? null;
}
