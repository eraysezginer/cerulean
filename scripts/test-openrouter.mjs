/**
 * Kısa OpenRouter testi: `node scripts/test-openrouter.mjs`
 * Proje kökündeki .env dosyasını (basit) okur; anahtarı ekrana yazmaz.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import OpenAI from "openai";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env");
let text = "";
try {
  text = readFileSync(envPath, "utf8");
} catch {
  console.error("Kökte .env bulunamadı:", envPath);
  process.exit(1);
}

for (const line of text.split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const i = t.indexOf("=");
  if (i === -1) continue;
  const k = t.slice(0, i).trim();
  let v = t.slice(i + 1).trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }
  if (k && process.env[k] === undefined) process.env[k] = v;
}

const key = process.env.OPENROUTER_API_KEY?.trim();
const defModel = process.env.OPENROUTER_DEFAULT_MODEL?.trim() || "openai/gpt-4o-mini";
const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";

if (!key) {
  console.error("OPENROUTER_API_KEY .env içinde yok veya boş.");
  process.exit(1);
}

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: key,
  defaultHeaders: {
    "HTTP-Referer": appUrl,
    "X-Title": "Cerulean test",
  },
});

const res = await client.chat.completions.create({
  model: defModel,
  messages: [{ role: "user", content: "Reply with exactly: TEST_OK" }],
  max_tokens: 20,
  temperature: 0,
});

const content = res.choices[0]?.message?.content?.trim() ?? "";
console.log("ok: true");
console.log("defaultModel (env):", defModel);
console.log("response.model:", res.model);
console.log("response.content:", content);
process.exit(0);
