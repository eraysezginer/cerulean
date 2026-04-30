import { NextResponse } from "next/server";
import { getCompanyById } from "@/data/companies";
import type { CompanyFlagDetail } from "@/data/flag-types";
import { AiScenario } from "@/lib/ai/scenarios";
import {
  assignFlagIds,
  buildDocumentIngestAiMessages,
} from "@/lib/ai/analysis/document-ingest-ai-messages";
import { parseIngestAiJson } from "@/lib/ai/analysis/parse-model-flags-json";
import { readStoredFilesAsMultimodalParts } from "@/lib/ai/analysis/read-stored-upload-files";
import {
  isAiTraceEnabled,
  logAiAnalyzeTrace,
  summarizeMessagesForLog,
} from "@/lib/ai/analysis/ai-request-trace";
import { createChatCompletion, isOpenRouterConfigured } from "@/lib/ai";
import { selectIngestByJobId, updateIngestFromAiIngestResult } from "@/lib/db/document-ingest";

export const runtime = "nodejs";

type PostBody = {
  scenario?: string;
  jobId?: string;
  /** true = call model again; false/omit = return stored result if it exists */
  regenerate?: boolean;
};

function toBool(v: number | boolean): boolean {
  return v === true || v === 1;
}

/**
 * Loads ingest + stored files, sends them to the model with precomputed context (no prior flags),
 * expects JSON with `flags` + `analysis`, persists to DocumentIngest.
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!isOpenRouterConfigured()) {
    return NextResponse.json(
      {
        error:
          "AI is not configured. Set OPENROUTER_API_KEY in the server environment and restart the app.",
      },
      { status: 503 }
    );
  }

  const companyId = params.id;
  let body: PostBody;
  try {
    body = (await req.json()) as PostBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const scenario = body.scenario?.trim();
  if (scenario === AiScenario.postUploadDocument) {
    const jobId = body.jobId?.trim();
    if (!jobId) {
      return NextResponse.json({ error: "jobId is required for this scenario" }, { status: 400 });
    }

    let row: Awaited<ReturnType<typeof selectIngestByJobId>>;
    try {
      row = await selectIngestByJobId(jobId);
    } catch (e) {
      console.error("[ai/analyze] database (select ingest)", e);
      const detail = e instanceof Error ? e.message : "Database error";
      return NextResponse.json(
        {
          error: `Database error: ${detail}. Check DATABASE_URL, credentials, and that MySQL is running.`,
        },
        { status: 503 }
      );
    }
    if (!row || row.companyId !== companyId) {
      return NextResponse.json({ error: "Ingest not found" }, { status: 404 });
    }

    if (toBool(row.suppressFlags)) {
      return NextResponse.json(
        { error: "This ingest has monitoring output suppressed; AI flag generation is disabled." },
        { status: 400 }
      );
    }

    const company = await getCompanyById(companyId);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    if (!body.regenerate) {
      const hasNewRun = row.aiAnalysisAt != null;
      const hasLegacyAnalysis = Boolean(row.aiAnalysisText?.trim());
      if (hasNewRun || hasLegacyAnalysis) {
        let flags: CompanyFlagDetail[] = [];
        try {
          flags = row.flagsJson ? (JSON.parse(row.flagsJson) as typeof flags) : [];
        } catch {
          flags = [];
        }
        return NextResponse.json({
          scenario: AiScenario.postUploadDocument,
          analysis: row.aiAnalysisText ?? "",
          flags,
          model: row.aiAnalysisModel ?? null,
          cached: true,
        });
      }
    }

    const { parts, textNotes } = await readStoredFilesAsMultimodalParts(
      row.storedFilesJson,
      process.cwd()
    );
    if (parts.length === 0) {
      return NextResponse.json(
        {
          error:
            "No file content could be loaded for this ingest. Check storage paths and INGEST_AI_* size limits.",
        },
        { status: 400 }
      );
    }

    const messages = buildDocumentIngestAiMessages({
      row,
      companyName: company.name,
      multimodalParts: parts,
      sizeNotes: textNotes,
    });

    const tracePayloadOut = {
      openRouter: {
        temperature: 0.25,
        maxTokens: 4_096,
        response_format: { type: "json_object" as const },
      },
      messages: summarizeMessagesForLog(messages),
    };
    logAiAnalyzeTrace("out", tracePayloadOut);

    let out: Awaited<ReturnType<typeof createChatCompletion>>;
    try {
      out = await createChatCompletion({
        messages,
        temperature: 0.25,
        maxTokens: 4_096,
        openRouterExtras: {
          response_format: { type: "json_object" },
        },
      });
    } catch (e) {
      console.error("[ai/analyze] OpenRouter request failed", e);
      logAiAnalyzeTrace("error", { afterRequestOut: tracePayloadOut, err: String(e) });
      const detail =
        e && typeof e === "object" && "message" in e && typeof (e as { message: unknown }).message === "string"
          ? (e as { message: string }).message
          : "OpenRouter request failed";
      return NextResponse.json(
        {
          error: `Model request failed: ${detail}`,
          ...(isAiTraceEnabled()
            ? { _trace: { request: tracePayloadOut, error: String(e) } }
            : {}),
        },
        { status: 502 }
      );
    }

    const parsed = parseIngestAiJson(out.content, (n) =>
      assignFlagIds(companyId, jobId, n)
    );
    const flagsJson = JSON.stringify(parsed.flags);

    const tracePayloadIn = {
      model: out.model,
      finishReason: out.finishReason,
      usage: out.usage,
      /** Raw model text (JSON string) */
      content: out.content,
      parsed: { flagCount: parsed.flags.length, analysisLength: parsed.analysis.length },
    };
    logAiAnalyzeTrace("in", tracePayloadIn);

    try {
      await updateIngestFromAiIngestResult(jobId, {
        flagsJson,
        analysisText: parsed.analysis,
        model: out.model,
      });
    } catch (e) {
      console.error(
        "[ai/analyze] persist failed (flags + analysis; run migrations if columns missing?)",
        e
      );
      return NextResponse.json(
        {
          error:
            "Could not save AI result. Ensure DB schema includes flagsJson and aiAnalysis* on DocumentIngest.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      scenario: AiScenario.postUploadDocument,
      analysis: parsed.analysis,
      flags: parsed.flags,
      model: out.model,
      cached: false,
      ...(isAiTraceEnabled()
        ? {
            _trace: {
              request: tracePayloadOut,
              response: tracePayloadIn,
            },
          }
        : {}),
    });
  }

  return NextResponse.json(
    { error: `Unknown scenario. Supported: ${AiScenario.postUploadDocument}` },
    { status: 400 }
  );
}
