import { NextResponse } from "next/server";
import { getJobView } from "@/lib/upload-jobs";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: { jobId: string } }
) {
  const view = await getJobView(params.jobId);
  if (!view) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const { job, state, steps, flagsGenerated, aiAnalysis, aiAnalysisModel } = view;
  const stepsComplete = steps.filter((s) => s.status === "complete").length;

  return NextResponse.json({
    status: state,
    stepsComplete,
    flagsGenerated,
    eta: state === "processing" ? "45 seconds" : "0 seconds",
    steps,
    documentId: job.documentId,
    fileName: job.fileName,
    fileSize: job.fileSize,
    hash: job.hash,
    updateLabel: job.updateLabel,
    documentDate: job.documentDate,
    documentTypeName: job.documentTypeName,
    temporalType: job.temporalType,
    processingSeconds: job.processingSeconds,
    flags: state === "complete" ? job.flags : undefined,
    aiAnalysis: state === "complete" ? aiAnalysis : undefined,
    aiAnalysisModel: state === "complete" ? aiAnalysisModel : undefined,
  });
}
