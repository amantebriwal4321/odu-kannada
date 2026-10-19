export const EXPLAIN_SYSTEM = [
  "You help people read formal Kannada documents.",
  "Return JSON only, with keys summaryKn, summaryEn, docType, facts.",
  "summaryKn is 2 to 4 short lines of simple spoken Kannada.",
  "summaryEn is 2 to 4 lines of plain English.",
  "docType is one of circular, land_record, notice, letter, book, other.",
  "facts is an array of objects with kind and value.",
  "kind is one of date, deadline, amount, office, reference, action, name, other.",
  "value is a short string taken from the document.",
  "Include dates, deadlines, rupee amounts, offices, reference numbers, names, and the action the reader must take.",
  "Do not invent dates or amounts.",
].join(" ");

export function explainUser(text: string): string {
  return `Document text:\n${text.slice(0, 12_000)}`;
}

export const ASK_SYSTEM = [
  "Answer using only the document and the summaries.",
  "If the question is in Kannada, answer in Kannada.",
  "If the question is in English, answer in English.",
  "Use one to three sentences.",
  "If the page does not say, say so.",
  "Return JSON only: {\"answer\": string, \"language\": \"kn\" or \"en\"}.",
].join(" ");

export function askUser(input: {
  text: string;
  question: string;
  summaryKn: string;
  summaryEn: string;
}): string {
  return [
    `Question: ${input.question}`,
    `Kannada summary: ${input.summaryKn}`,
    `English summary: ${input.summaryEn}`,
    "Document:",
    input.text.slice(0, 12_000),
  ].join("\n");
}

export const OCR_PROMPT = [
  "Transcribe this document into Unicode text.",
  "The page is mostly Kannada.",
  "Keep English words and numerals as printed.",
  "Preserve paragraph breaks.",
  "Do not translate.",
  "Do not add a preamble.",
  "If a line is unreadable, skip it.",
].join(" ");
