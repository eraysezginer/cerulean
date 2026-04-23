import type {
  ChatCompletion,
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionCreateParamsStreaming,
  ChatCompletionMessageParam,
} from "openai/resources/chat/completions";
import { getOpenRouterClient } from "./client";
import { getOpenRouterDefaultModel } from "./config";

export type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export type CreateChatOptions = {
  /** OpenRouter model id; boşsa `OPENROUTER_DEFAULT_MODEL` / `openai/gpt-4o-mini` */
  model?: string;
  messages: ChatCompletionMessageParam[];
  temperature?: number;
  maxTokens?: number;
  /** Sohbet dışı parametreler (ör. `response_format`, `top_p`) — `stream` vermeyin; ayrı API kullanın */
  openRouterExtras?: Partial<
    Omit<ChatCompletionCreateParamsNonStreaming, "model" | "messages">
  >;
};

export type CreateChatResult = {
  id: string;
  model: string;
  content: string;
  finishReason: string | null;
  usage: ChatCompletion["usage"];
  raw: ChatCompletion;
};

/**
 * Tek seferde tam yanıt (non-streaming). Farklı ekranlarda aynı fonksiyon, farklı `model` / `messages`.
 */
export async function createChatCompletion(
  options: CreateChatOptions
): Promise<CreateChatResult> {
  const client = getOpenRouterClient();
  const model = options.model?.trim() || getOpenRouterDefaultModel();
  const params: ChatCompletionCreateParamsNonStreaming = {
    model,
    messages: options.messages,
    temperature: options.temperature ?? 0.7,
    stream: false,
    ...(options.maxTokens != null ? { max_tokens: options.maxTokens } : {}),
    ...options.openRouterExtras,
  };

  const res = await client.chat.completions.create(params);
  const choice = res.choices[0];
  return {
    id: res.id,
    model: res.model,
    content: (choice?.message?.content as string) ?? "",
    finishReason: choice?.finish_reason ?? null,
    usage: res.usage,
    raw: res,
  };
}

/**
 * Akışlı yanıt (SSE / token token). Uzun cevaplar veya canlı UI için.
 */
export async function createChatCompletionStream(options: CreateChatOptions) {
  const client = getOpenRouterClient();
  const model = options.model?.trim() || getOpenRouterDefaultModel();
  const { openRouterExtras, ...rest } = options;
  const params = {
    model,
    messages: rest.messages,
    temperature: rest.temperature ?? 0.7,
    ...(rest.maxTokens != null ? { max_tokens: rest.maxTokens } : {}),
    ...openRouterExtras,
    stream: true,
  } satisfies ChatCompletionCreateParamsStreaming;
  return client.chat.completions.create(params);
}
