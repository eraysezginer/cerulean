import OpenAI from "openai";
import {
  getOpenRouterApiKey,
  getOpenRouterAppHeaders,
  OPENROUTER_BASE_URL,
} from "./config";

let _client: OpenAI | null = null;

/**
 * Tekil OpenRouter istemcisi (OpenAI SDK + özel baseURL).
 * Sadece sunucuda kullanın: Route Handler, Server Action, `server-only` modüller.
 */
export function getOpenRouterClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      baseURL: OPENROUTER_BASE_URL,
      apiKey: getOpenRouterApiKey(),
      defaultHeaders: getOpenRouterAppHeaders(),
    });
  }
  return _client;
}
