import { answerOffline, explainOffline } from "@/lib/offline";
import { coerceAnswer, extractJson, textFromModelContent } from "@/lib/model-json";
import { ASK_SYSTEM, askUser } from "@/lib/server/prompts";
import { geminiGenerate } from "@/lib/server/gemini";
import { sarvamChat } from "@/lib/server/sarvam";

export const maxDuration = 60;

export async function POST(request: Request) {
  let text = "";
  let question = "";
  let summaryKn = "";
  let summaryEn = "";
  try {
    const body = (await request.json()) as {
      text?: string;
      question?: string;
      summaryKn?: string;
      summaryEn?: string;
    };
    text = String(body.text ?? "");
    question = String(body.question ?? "").trim();
    summaryKn = String(body.summaryKn ?? "");
    summaryEn = String(body.summaryEn ?? "");
  } catch {
    return Response.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
  if (!question) return Response.json({ ok: false, error: "No question" }, { status: 400 });

  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const sarvamKey = process.env.SARVAM_API_KEY?.trim();
  const user = askUser({ text, question, summaryKn, summaryEn });

  if (geminiKey) {
    try {
      const raw = await geminiGenerate({
        key: geminiKey,
        model: process.env.GEMINI_MODEL,
        json: true,
        parts: [{ text: `${ASK_SYSTEM}\n\n${user}` }],
      });
      const parsed = coerceAnswer(extractJson(raw), raw);
      if (parsed) return Response.json({ ok: true, provider: "gemini", ...parsed });
    } catch (error) {
      console.error("Gemini ask fell through", error instanceof Error ? error.message : "error");
    }
  }

  if (sarvamKey) {
    try {
      const raw = await sarvamChat({ key: sarvamKey, system: ASK_SYSTEM, user });
      const content = textFromModelContent(raw);
      const parsed = coerceAnswer(extractJson(content), content);
      if (parsed) return Response.json({ ok: true, provider: "sarvam", ...parsed });
    } catch (error) {
      console.error("Sarvam ask fell through", error instanceof Error ? error.message : "error");
    }
  }

  const explained = explainOffline(text);
  const offline = answerOffline(text, question, {
    ...explained,
    summaryKn: summaryKn || explained.summaryKn,
    summaryEn: summaryEn || explained.summaryEn,
  });
  return Response.json({ ok: true, provider: "offline", ...offline });
}
