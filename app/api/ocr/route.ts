import { OCR_PROMPT } from "@/lib/server/prompts";
import { geminiGenerate } from "@/lib/server/gemini";
import { sarvamDigitize } from "@/lib/server/sarvam";

export const maxDuration = 60;

type OcrBody = { mime?: string; base64?: string };

function cleanTranscript(text: string): string {
  return text.replace(/^```[\w]*\n?/, "").replace(/```$/g, "").trim();
}

export async function POST(request: Request) {
  let body: OcrBody;
  try {
    body = (await request.json()) as OcrBody;
  } catch {
    return Response.json({ ok: false, fallback: "tesseract", reason: "Bad request" }, { status: 400 });
  }
  const mime = body.mime || "image/jpeg";
  const base64 = body.base64 || "";
  if (!base64 || base64.length > 8_000_000) {
    return Response.json(
      { ok: false, fallback: "tesseract", reason: "Image missing or too large" },
      { status: 400 },
    );
  }
  const bytes = Buffer.from(base64, "base64");
  const filename = mime.includes("png") ? "page.png" : "page.jpg";
  const sarvamKey = process.env.SARVAM_API_KEY?.trim();
  const geminiKey = process.env.GEMINI_API_KEY?.trim();

  if (sarvamKey) {
    try {
      const text = cleanTranscript(
        await sarvamDigitize({ key: sarvamKey, bytes, mime, filename }),
      );
      if (text) return Response.json({ ok: true, provider: "sarvam", text });
    } catch (error) {
      console.error("Sarvam OCR fell through", error instanceof Error ? error.message : "error");
    }
  }

  if (geminiKey) {
    try {
      const text = cleanTranscript(
        await geminiGenerate({
          key: geminiKey,
          model: process.env.GEMINI_MODEL,
          parts: [
            { inline_data: { mime_type: mime, data: base64 } },
            { text: OCR_PROMPT },
          ],
        }),
      );
      if (text) return Response.json({ ok: true, provider: "gemini", text });
    } catch (error) {
      console.error("Gemini OCR fell through", error instanceof Error ? error.message : "error");
    }
  }

  return Response.json({
    ok: false,
    fallback: "tesseract",
    reason: sarvamKey || geminiKey ? "Provider failed" : "No OCR key",
  });
}
