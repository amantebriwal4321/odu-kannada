export const DOC_TYPES = [
  "circular",
  "land_record",
  "notice",
  "letter",
  "book",
  "other",
] as const;

export type DocType = (typeof DOC_TYPES)[number];

export const FACT_KINDS = [
  "date",
  "deadline",
  "amount",
  "office",
  "reference",
  "action",
  "name",
  "other",
] as const;

export type FactKind = (typeof FACT_KINDS)[number];

export type Fact = {
  kind: FactKind;
  value: string;
};

export type ExplainResult = {
  summaryKn: string;
  summaryEn: string;
  docType: DocType;
  facts: Fact[];
};

export type Sample = {
  id: string;
  file: string;
  sha256: string;
  titleKn: string;
  titleEn: string;
  docType: DocType;
  text: string;
  summaryKn: string;
  summaryEn: string;
  facts: Fact[];
};

export type ProviderStatus = {
  keys: { sarvam: boolean; gemini: boolean };
  ocr: "sarvam" | "gemini" | "tesseract";
  explain: "gemini" | "sarvam" | "offline";
  tts: "sarvam" | "browser";
};

export type SavedDoc = {
  id: string;
  createdAt: number;
  updatedAt: number;
  title: string;
  text: string;
  docType: DocType;
  summaryKn: string;
  summaryEn: string;
  facts: Fact[];
  ocrProvider: string;
  explainProvider: string;
  image: Blob;
  sampleId?: string;
};
