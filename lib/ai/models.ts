/**
 * Sık kullanılan OpenRouter model id'leri (referans; istediğiniz string'i `model` ile geçebilirsiniz).
 * Güncel liste: https://openrouter.ai/models
 */
export const OpenRouterModel = {
  gpt4oMini: "openai/gpt-4o-mini",
  gpt4o: "openai/gpt-4o",
  claude35Sonnet: "anthropic/claude-3.5-sonnet",
  geminiFlash: "google/gemini-2.0-flash-001",
} as const;

export type OpenRouterModelId = (typeof OpenRouterModel)[keyof typeof OpenRouterModel] | (string & {});
