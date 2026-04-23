/**
 * OpenRouter + OpenAI SDK — merkezi AI katmanı.
 *
 * - Sunucu kodunda doğrudan: `import { createChatCompletion, OpenRouterModel } from "@/lib/ai"`.
 * - Tarayıcıdan: yalnızca kendi API route'unuza `fetch` yapın; anahtar istemciye gitmez.
 */
export {
  isOpenRouterConfigured,
  getOpenRouterDefaultModel,
  OPENROUTER_BASE_URL,
} from "./config";
export { getOpenRouterClient } from "./client";
export {
  createChatCompletion,
  createChatCompletionStream,
} from "./chat";
export type { CreateChatOptions, CreateChatResult, ChatCompletionMessageParam } from "./chat";
export { OpenRouterModel, type OpenRouterModelId } from "./models";
export { AiScenario, type AiScenarioId } from "./scenarios";
