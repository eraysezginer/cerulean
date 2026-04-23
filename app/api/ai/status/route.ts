import { NextResponse } from "next/server";
import { isOpenRouterConfigured } from "@/lib/ai";

/**
 * Arayüzde “AI hazır mı?” göstermek için (anahtar sızdırmaz).
 */
export async function GET() {
  return NextResponse.json({ openrouter: isOpenRouterConfigured() });
}
