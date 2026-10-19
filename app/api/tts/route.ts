import { sarvamSpeak } from "@/lib/server/sarvam";

export const maxDuration = 60;

function chunkText(text: string, size = 1400): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  if (clean.length <= size) return [clean];
  const parts: string[] = [];
  let rest = clean;
  while (rest.length > size && parts.length < 5) {
    let cut = rest.lastIndexOf(" ", size);
    const danda = rest.lastIndexOf("।", size);
    if (danda > size * 0.4) cut = danda + 1;
    if (cut < size * 0.4) cut = size;
    parts.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest && parts.length < 6) parts.push(rest);
  return parts.filter(Boolean);
}

export async function POST(request: Request) {
  let text = "";
  try {
    const body = (await request.json()) as { text?: string };
    text = String(body.text ?? "");
  } catch {
    return Response.json({ ok: false, fallback: "browser" }, { status: 400 });
  }
  const chunks = chunkText(text).slice(0, 4);
  const key = process.env.SARVAM_API_KEY?.trim();
  if (!key || chunks.length === 0) {
    return Response.json({ ok: false, fallback: "browser" });
  }
  try {
    const clips = [];
    for (const chunk of chunks) {
      const spoken = await sarvamSpeak({ key, text: chunk });
      clips.push(...spoken);
    }
    return Response.json({ ok: true, provider: "sarvam", clips });
  } catch (error) {
    console.error("Sarvam TTS fell through", error instanceof Error ? error.message : "error");
    return Response.json({ ok: false, fallback: "browser" });
  }
}
