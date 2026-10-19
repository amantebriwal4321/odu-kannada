import { geminiModel } from "@/lib/providers";

type GeminiPart = { text?: string };

export async function geminiGenerate(input: {
  key: string;
  model?: string | null;
  parts: Array<{ text: string } | { inline_data: { mime_type: string; data: string } }>;
  json?: boolean;
}): Promise<string> {
  const model = geminiModel(input.model);
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": input.key,
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: input.parts }],
        generationConfig: {
          temperature: 0.2,
          ...(input.json ? { responseMimeType: "application/json" } : {}),
        },
      }),
      signal: AbortSignal.timeout(35_000),
    },
  );
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 400);
    throw new Error(`Gemini failed (${response.status}): ${detail}`);
  }
  const body = (await response.json()) as {
    candidates?: { content?: { parts?: GeminiPart[] } }[];
  };
  const text = (body.candidates?.[0]?.content?.parts ?? []).map((part) => part.text ?? "").join("").trim();
  if (!text) throw new Error("Gemini returned no text");
  return text;
}
