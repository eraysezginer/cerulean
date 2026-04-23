/**
 * OpenRouter — OpenAI API uyumlu uç nokta.
 * @see https://openrouter.ai/docs#requests
 */
export const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

/** Sunucu tarafında: anahtar yoksa AI çağrıları yapmazsınız. */
export function isOpenRouterConfigured(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY?.trim());
}

export function getOpenRouterApiKey(): string {
  const k = process.env.OPENROUTER_API_KEY?.trim();
  if (!k) {
    throw new Error(
      "OPENROUTER_API_KEY is not set. Add it to .env (see .env.example)."
    );
  }
  return k;
}

/**
 * `model` parametresi verilmezse kullanılır. OpenRouter model id (ör. `openai/gpt-4o-mini`).
 */
export function getOpenRouterDefaultModel(): string {
  return process.env.OPENROUTER_DEFAULT_MODEL?.trim() || "openai/gpt-4o-mini";
}

/** OpenRouter istatistik / sıralama için önerilen başlıklar. */
export function getOpenRouterAppHeaders(): Record<string, string> {
  const site = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
  const title = process.env.OPENROUTER_APP_NAME?.trim() || "Cerulean";
  return {
    "HTTP-Referer": site,
    "X-Title": title,
  };
}
