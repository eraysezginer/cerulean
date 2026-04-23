/**
 * AI scenario ids — each screen or trigger passes a different `scenario` to the same API.
 *
 * Flow (all on the server; key stays secret):
 * 1) On an event (e.g. upload finished) the client sends `jobId` + `scenario`.
 * 2) The API loads rows from the database and builds the prompt.
 * 3) `createChatCompletion` → OpenRouter → text response.
 * 4) The client shows flags + analysis from the response / job poll.
 */
export const AiScenario = {
  /** After upload: files + precomputed context → model returns JSON flags + analysis (server persists) */
  postUploadDocument: "post_upload_document",
} as const;

export type AiScenarioId = (typeof AiScenario)[keyof typeof AiScenario];
