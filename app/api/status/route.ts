import { connection } from "next/server";
import { configuredProviders } from "@/lib/providers";

export async function GET() {
  await connection();
  const body = configuredProviders({
    sarvam: process.env.SARVAM_API_KEY,
    gemini: process.env.GEMINI_API_KEY,
  });
  return Response.json(body, {
    headers: { "cache-control": "no-store" },
  });
}
