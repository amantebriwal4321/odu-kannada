import { DOC_TYPES, FACT_KINDS, type DocType, type ExplainResult, type Fact, type FactKind } from "@/lib/types";

export function extractJson(raw: string): unknown {
  const trimmed = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error("Model did not return JSON");
  }
}

export function coerceExplain(value: unknown): ExplainResult | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const summaryKn = typeof record.summaryKn === "string" ? record.summaryKn.trim() : "";
  const summaryEn = typeof record.summaryEn === "string" ? record.summaryEn.trim() : "";
  if (!summaryKn || !summaryEn) return null;
  const docType = DOC_TYPES.includes(record.docType as DocType)
    ? (record.docType as DocType)
    : "other";
  const facts: Fact[] = [];
  if (Array.isArray(record.facts)) {
    for (const item of record.facts) {
      if (!item || typeof item !== "object") continue;
      const rawKind = String((item as { kind?: unknown }).kind ?? "other");
      const kind = (FACT_KINDS as readonly string[]).includes(rawKind)
        ? (rawKind as FactKind)
        : "other";
      const factValue = String((item as { value?: unknown }).value ?? "").trim();
      if (factValue) facts.push({ kind, value: factValue.slice(0, 180) });
    }
  }
  return { summaryKn, summaryEn, docType, facts: facts.slice(0, 12) };
}

export function coerceAnswer(value: unknown, fallbackText: string): { answer: string; language: "kn" | "en" } | null {
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const answer = typeof record.answer === "string" ? record.answer.trim() : "";
    if (answer) {
      const language = record.language === "en" ? "en" : /[\u0C80-\u0CFF]/.test(answer) ? "kn" : "en";
      return { answer, language };
    }
  }
  const plain = fallbackText.trim();
  if (!plain) return null;
  return {
    answer: plain.slice(0, 800),
    language: /[\u0C80-\u0CFF]/.test(plain) ? "kn" : "en",
  };
}

export function textFromModelContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object" && "text" in part) {
          return String((part as { text?: unknown }).text ?? "");
        }
        return "";
      })
      .join("");
  }
  return "";
}
