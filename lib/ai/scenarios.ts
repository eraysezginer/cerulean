/**
 * AI “durum”ları — her ekran / tetikleyici farklı `scenario` ile aynı API’yi kullanır.
 *
 * Akış (hepsi sunucuda, anahtar güvende):
 * 1) Uygulama bir olayda (ör. yükleme bitti) `jobId` + `scenario` gönderir.
 * 2) API veritabanından ilgili satırları okur, prompt metnini oluşturur.
 * 3) `createChatCompletion` → OpenRouter → metin döner.
 * 4) İstemci bu metni kullanıcıya gösterir.
 */
export const AiScenario = {
  /** Yükleme tamamlandıktan sonra: ingest + bayrak özeti → analiz metni */
  postUploadDocument: "post_upload_document",
} as const;

export type AiScenarioId = (typeof AiScenario)[keyof typeof AiScenario];
