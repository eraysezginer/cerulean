import { NextResponse } from "next/server";
import { getCompanyById } from "@/data/companies";
import { AiScenario } from "@/lib/ai/scenarios";
import { buildPostUploadDocumentMessages } from "@/lib/ai/analysis/post-upload-messages";
import { createChatCompletion, isOpenRouterConfigured, OpenRouterModel } from "@/lib/ai";
import { selectIngestByJobId } from "@/lib/db/document-ingest";

export const runtime = "nodejs";

type PostBody = {
  scenario?: string;
  jobId?: string;
};

/**
 * Belirli bir “durum”da (scenario) sunucudaki verilerle modelden analiz metni üretir.
 * İstemci yalnızca `scenario` + gerekli id’leri gönderir; API geri kalanını DB’den toplar.
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!isOpenRouterConfigured()) {
    return NextResponse.json(
      { error: "AI is not configured (OPENROUTER_API_KEY)." },
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

    const row = await selectIngestByJobId(jobId);
    if (!row || row.companyId !== companyId) {
      return NextResponse.json({ error: "Ingest not found" }, { status: 404 });
    }

    const company = await getCompanyById(companyId);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const messages = buildPostUploadDocumentMessages({
      companyName: company.name,
      fileDisplayName: row.fileDisplayName,
      documentTypeName: row.documentTypeName,
      temporalType: row.temporalType,
      updateLabel: row.updateLabel,
      documentDate: row.documentDate,
      receivedDate: row.receivedDate,
      language: row.language,
      primaryHash: row.primaryHash,
      processingSeconds: row.processingSeconds,
      flagsJson: row.flagsJson,
    });

    const out = await createChatCompletion({
      model: OpenRouterModel.gpt4oMini,
      messages,
      temperature: 0.35,
      maxTokens: 1_200,
    });

    return NextResponse.json({
      scenario: AiScenario.postUploadDocument,
      analysis: out.content,
      model: out.model,
    });
  }

  return NextResponse.json(
    { error: `Unknown scenario. Supported: ${AiScenario.postUploadDocument}` },
    { status: 400 }
  );
}
