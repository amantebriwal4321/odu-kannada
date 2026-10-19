import { strFromU8, unzipSync } from "fflate";

const SARVAM = "https://api.sarvam.ai";
const TERMINAL = new Set(["completed", "partially_completed", "failed", "rejected"]);

function headers(key: string): HeadersInit {
  return { "api-subscription-key": key };
}

async function readError(response: Response): Promise<string> {
  const body = await response.text();
  return body.slice(0, 400);
}

function markdownToText(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function textFromZip(bytes: Uint8Array): string {
  const files = unzipSync(bytes);
  const names = Object.keys(files).sort();
  const chunks: string[] = [];
  for (const name of names) {
    const lower = name.toLowerCase();
    if (lower.endsWith(".md") || lower.endsWith(".txt") || lower.endsWith(".html") || lower.endsWith(".json")) {
      const raw = strFromU8(files[name]);
      if (lower.endsWith(".html")) chunks.push(htmlToText(raw));
      else if (lower.endsWith(".md")) chunks.push(markdownToText(raw));
      else if (lower.endsWith(".json") && !lower.endsWith("manifest.json")) {
        chunks.push(raw);
      } else if (lower.endsWith(".txt")) chunks.push(raw.trim());
    }
  }
  return chunks.filter(Boolean).join("\n\n").trim();
}

export async function sarvamDigitize(input: {
  key: string;
  bytes: Uint8Array;
  mime: string;
  filename: string;
}): Promise<string> {
  const form = new FormData();
  form.append("file", new Blob([Buffer.from(input.bytes)], { type: input.mime }), input.filename);
  form.append("language", "kn-IN");
  form.append("output_format", "md");

  const createdRes = await fetch(`${SARVAM}/doc-ai/v1/job/digitise`, {
    method: "POST",
    headers: headers(input.key),
    body: form,
    signal: AbortSignal.timeout(25_000),
  });
  if (!createdRes.ok) {
    throw new Error(`Sarvam digitise failed (${createdRes.status}): ${await readError(createdRes)}`);
  }
  const created = (await createdRes.json()) as { job_id?: string; status?: string };
  if (!created.job_id) throw new Error("Sarvam digitise did not return a job id");

  const deadline = Date.now() + 20_000;
  let status = String(created.status ?? "pending").toLowerCase();
  while (!TERMINAL.has(status)) {
    if (Date.now() > deadline) throw new Error("Sarvam digitise still running");
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const statusRes = await fetch(`${SARVAM}/doc-ai/v1/job/${created.job_id}/status`, {
      headers: headers(input.key),
      signal: AbortSignal.timeout(10_000),
    });
    if (!statusRes.ok) {
      throw new Error(`Sarvam status failed (${statusRes.status})`);
    }
    const body = (await statusRes.json()) as { status?: string };
    status = String(body.status ?? "").toLowerCase();
  }
  if (status !== "completed" && status !== "partially_completed") {
    throw new Error(`Sarvam digitise ended as ${status}`);
  }

  const linkRes = await fetch(`${SARVAM}/doc-ai/v1/job/${created.job_id}/download-url`, {
    headers: headers(input.key),
    signal: AbortSignal.timeout(10_000),
  });
  if (!linkRes.ok) throw new Error(`Sarvam download url failed (${linkRes.status})`);
  const link = (await linkRes.json()) as {
    method?: string;
    url?: string;
    headers?: Record<string, string>;
  };
  if (!link.url) throw new Error("Sarvam download url was empty");
  const fileRes = await fetch(link.url, {
    method: link.method || "GET",
    headers: link.headers,
    signal: AbortSignal.timeout(20_000),
  });
  if (!fileRes.ok) throw new Error(`Sarvam output download failed (${fileRes.status})`);
  const text = textFromZip(new Uint8Array(await fileRes.arrayBuffer()));
  if (!text) throw new Error("Sarvam output zip had no text");
  return text;
}

export async function sarvamChat(input: { key: string; system: string; user: string }): Promise<string> {
  const response = await fetch(`${SARVAM}/v1/chat/completions`, {
    method: "POST",
    headers: { ...headers(input.key), "content-type": "application/json" },
    body: JSON.stringify({
      model: "sarvam-105b",
      temperature: 0.2,
      reasoning_effort: "low",
      messages: [
        { role: "system", content: input.system },
        { role: "user", content: input.user },
      ],
    }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) {
    throw new Error(`Sarvam chat failed (${response.status}): ${await readError(response)}`);
  }
  const body = (await response.json()) as {
    choices?: { message?: { content?: unknown } }[];
  };
  const content = body.choices?.[0]?.message?.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => (part && typeof part === "object" && "text" in part ? String(part.text ?? "") : ""))
      .join("");
  }
  return "";
}

function mimeFromAudio(base64: string): string {
  const head = Buffer.from(base64.slice(0, 24), "base64").toString("latin1");
  if (head.startsWith("RIFF")) return "audio/wav";
  if (head.startsWith("ID3") || head.charCodeAt(0) === 0xff) return "audio/mpeg";
  return "audio/wav";
}

export async function sarvamSpeak(input: { key: string; text: string }): Promise<{ audioBase64: string; mime: string }[]> {
  const attempts = [
    { model: "bulbul:v4-flash", speaker: "suchitra_kn_narration" },
    { model: "bulbul:v3", speaker: "shubh" },
  ];
  let lastError = "Sarvam TTS failed";
  for (const attempt of attempts) {
    const response = await fetch(`${SARVAM}/text-to-speech`, {
      method: "POST",
      headers: { ...headers(input.key), "content-type": "application/json" },
      body: JSON.stringify({
        text: input.text,
        language_code: "kn-IN",
        speaker: attempt.speaker,
        model: attempt.model,
        pace: 1,
      }),
      signal: AbortSignal.timeout(25_000),
    });
    if (!response.ok) {
      lastError = `Sarvam TTS ${attempt.model} failed (${response.status})`;
      continue;
    }
    const body = (await response.json()) as { audios?: string[]; audio?: string };
    const audio = body.audios?.[0] ?? body.audio;
    if (!audio) {
      lastError = "Sarvam TTS returned no audio";
      continue;
    }
    return [{ audioBase64: audio, mime: mimeFromAudio(audio) }];
  }
  throw new Error(lastError);
}
