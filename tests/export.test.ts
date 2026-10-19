import { describe, expect, it } from "vitest";
import { toMd, toSearchJson, toTxt } from "@/lib/export";
import { configuredProviders } from "@/lib/providers";
import { coerceExplain, extractJson } from "@/lib/model-json";

const doc = {
  id: "sample:pension-circular",
  title: "ಪಿಂಚಣಿ ಸುತ್ತೋಲೆ",
  updatedAt: Date.UTC(2026, 9, 19),
  docType: "circular" as const,
  text: "ಪಠ್ಯ",
  summaryKn: "ಸಾರಾಂಶ",
  summaryEn: "A circular about pension.",
  facts: [{ kind: "amount" as const, value: "₹1,200" }],
  ocrProvider: "sample",
  explainProvider: "sample",
};

describe("export", () => {
  it("writes text and both summaries", () => {
    const txt = toTxt(doc);
    expect(txt).toContain("ಪಿಂಚಣಿ ಸುತ್ತೋಲೆ");
    expect(txt).toContain("ಸಾರಾಂಶ");
    expect(txt).toContain("A circular about pension.");
    expect(toMd(doc)).toContain("## English summary");
  });

  it("writes searchable JSON without a photo field", () => {
    const parsed = JSON.parse(toSearchJson([doc])) as { app: string; documents: { text: string; image?: string }[] };
    expect(parsed.app).toBe("odu");
    expect(parsed.documents[0].text).toBe("ಪಠ್ಯ");
    expect(parsed.documents[0].image).toBeUndefined();
  });
});

describe("configuredProviders", () => {
  it("stays on local fallbacks when keys are missing", () => {
    expect(configuredProviders({})).toEqual({
      keys: { sarvam: false, gemini: false },
      ocr: "tesseract",
      explain: "offline",
      tts: "browser",
    });
  });

  it("prefers Sarvam for OCR and Gemini for explain when both keys exist", () => {
    const status = configuredProviders({ sarvam: "sk", gemini: "gk" });
    expect(status.ocr).toBe("sarvam");
    expect(status.explain).toBe("gemini");
    expect(status.tts).toBe("sarvam");
  });
});

describe("extractJson", () => {
  it("reads a fenced JSON object", () => {
    const value = extractJson('```json\n{"summaryKn":"ಓದು","summaryEn":"Read","docType":"notice","facts":[{"kind":"date","value":"1 ಮೇ 2026"}]}\n```');
    const result = coerceExplain(value);
    expect(result?.docType).toBe("notice");
    expect(result?.facts[0].value).toContain("2026");
  });
});
