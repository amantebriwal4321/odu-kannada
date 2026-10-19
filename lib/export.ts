import type { DocType, Fact } from "@/lib/types";

export type ExportDoc = {
  id: string;
  title: string;
  updatedAt: number;
  docType: DocType;
  text: string;
  summaryKn: string;
  summaryEn: string;
  facts: Fact[];
  ocrProvider: string;
  explainProvider: string;
};

function factLines(facts: Fact[]): string {
  if (!facts.length) return "";
  return facts.map((fact) => `${fact.kind}: ${fact.value}`).join("\n");
}

export function toTxt(doc: ExportDoc): string {
  return [
    doc.title,
    "",
    doc.text.trim(),
    "",
    "Kannada summary",
    doc.summaryKn.trim(),
    "",
    "English summary",
    doc.summaryEn.trim(),
    "",
    factLines(doc.facts),
  ]
    .filter((part, index, all) => part !== "" || all[index - 1] !== "")
    .join("\n")
    .trimEnd()
    .concat("\n");
}

export function toMd(doc: ExportDoc): string {
  const facts = doc.facts.length
    ? doc.facts.map((fact) => `- ${fact.kind}: ${fact.value}`).join("\n")
    : "";
  return [
    `# ${doc.title}`,
    "",
    doc.text.trim(),
    "",
    "## Kannada summary",
    "",
    doc.summaryKn.trim(),
    "",
    "## English summary",
    "",
    doc.summaryEn.trim(),
    "",
    facts ? "## Facts\n\n" + facts : "",
  ]
    .filter(Boolean)
    .join("\n")
    .concat("\n");
}

export function toSearchJson(docs: ExportDoc[]): string {
  return JSON.stringify(
    {
      app: "odu",
      documents: docs.map((doc) => ({
        id: doc.id,
        title: doc.title,
        updatedAt: new Date(doc.updatedAt).toISOString(),
        docType: doc.docType,
        text: doc.text,
        summaryKn: doc.summaryKn,
        summaryEn: doc.summaryEn,
        facts: doc.facts,
        ocrProvider: doc.ocrProvider,
        explainProvider: doc.explainProvider,
      })),
    },
    null,
    2,
  );
}
