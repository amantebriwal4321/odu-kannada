import { explainOffline } from "@/lib/offline";
import { coerceExplain, extractJson } from "@/lib/model-json";
import { EXPLAIN_SYSTEM, explainUser } from "@/lib/server/prompts";
import { geminiGenerate } from "@/lib/server/gemini";
import { sarvamChat } from "@/lib/server/sarvam";

export const maxDuration = 60;

export async function POST(request: Request) {
  let text = "";
  try {
    const body = (await request.json()) as { text?: string };
    text = String(body.text ?? "");
  } catch {
    return Response.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
  if (!text.trim()) {
    return Response.json({ ok: false, error: "No text" }, { status: 400 });
  }

  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const sarvamKey = process.env.SARVAM_API_KEY?.trim();
  const user = explainUser(text);

  if (geminiKey) {
    try {
      const raw = await geminiGenerate({
        key: geminiKey,
        model: process.env.GEMINI_MODEL,
        json: true,
        parts: [{ text: `${EXPLAIN_SYSTEM}\n\n${user}` }],
      });
      const result = coerceExplain(extractJson(raw));
      if (result) return Response.json({ ok: true, provider: "gemini", result });
    } catch (error) {
      console.error("Gemini explain fell through", error instanceof Error ? error.message : "error");
    }
  }

  if (sarvamKey) {
    try {
      const raw = await sarvamChat({ key: sarvamKey, system: EXPLAIN_SYSTEM, user });
      const result = coerceExplain(extractJson(raw));
      if (result) return Response.json({ ok: true, provider: "sarvam", result });
    } catch (error) {
      console.error("Sarvam explain fell through", error instanceof Error ? error.message : "error");
    }
  }

  return Response.json({ ok: true, provider: "offline", result: explainOffline(text) });
}
