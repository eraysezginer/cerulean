import { NextResponse } from "next/server";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { createChatCompletion, isOpenRouterConfigured } from "@/lib/ai";

export const runtime = "nodejs";

const MAX_MESSAGES = 64;
const MAX_MESSAGE_CHARS = 48_000;

function validateMessages(messages: unknown): messages is ChatCompletionMessageParam[] {
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    return false;
  }
  for (const m of messages) {
    if (typeof m !== "object" || m === null) return false;
    const role = (m as { role?: string }).role;
    if (role !== "system" && role !== "user" && role !== "assistant" && role !== "tool") {
      return false;
    }
    const content = (m as { content?: unknown }).content;
    if (typeof content === "string" && content.length > MAX_MESSAGE_CHARS) return false;
  }
  return true;
}

/**
 * İstemciden güvenli AI çağrısı: `OPENROUTER_API_KEY` yalnızca sunucuda kalır.
 *
 * Body: { model?: string, messages: ChatCompletionMessageParam[], temperature?: number, maxTokens?: number }
 */
export async function POST(req: Request) {
  if (!isOpenRouterConfigured()) {
    return NextResponse.json(
      { error: "OpenRouter is not configured (OPENROUTER_API_KEY missing)." },
      { status: 503 }
    );
  }

  let body: {
    model?: string;
    messages?: unknown;
    temperature?: number;
    maxTokens?: number;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!validateMessages(body.messages)) {
    return NextResponse.json(
      { error: "Invalid messages (array, 1–64 items, string content length limits)" },
      { status: 400 }
    );
  }

  try {
    const out = await createChatCompletion({
      model: body.model,
      messages: body.messages,
      temperature: body.temperature,
      maxTokens: body.maxTokens,
    });
    return NextResponse.json({
      id: out.id,
      model: out.model,
      content: out.content,
      finishReason: out.finishReason,
      usage: out.usage,
    });
  } catch (e) {
    console.error("[api/ai/chat]", e);
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}
