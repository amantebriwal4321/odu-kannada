import { foldKannadaDigits } from "@/lib/normalize";
import type { DocType, ExplainResult, Fact } from "@/lib/types";

const KN_MONTHS = [
  "ಜನವರಿ",
  "ಫೆಬ್ರವರಿ",
  "ಮಾರ್ಚ್",
  "ಏಪ್ರಿಲ್",
  "ಮೇ",
  "ಜೂನ್",
  "ಜುಲೈ",
  "ಆಗಸ್ಟ್",
  "ಸೆಪ್ಟೆಂಬರ್",
  "ಅಕ್ಟೋಬರ್",
  "ನವೆಂಬರ್",
  "ಡಿಸೆಂಬರ್",
];

const EN_MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

const DEADLINE_CUES = ["ಒಳಗೆ", "ರೊಳಗೆ", "ಮುಂಚೆ", "ಕೊನೆಯ", "deadline", "last date", "within", "before"];

const DOC_TYPE_EN: Record<DocType, string> = {
  circular: "a circular",
  land_record: "a land record extract",
  notice: "a notice",
  letter: "a letter",
  book: "a book page",
  other: "a document",
};

function unique(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const key = value.replace(/\s+/g, " ").trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}

function sentences(text: string): string[] {
  return text
    .split(/\n+|(?<=[।.!?])\s+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 1 && part !== "ಕಾಲ್ಪನಿಕ ಮಾದರಿ");
}

export function guessDocType(text: string): DocType {
  if (/ಪಹಣಿ|ಆರ್\.?\s?ಟಿ\.?\s?ಸಿ|\bRTC\b|ಸರ್ವೆ ಸಂಖ್ಯೆ|ಖಾತೆದಾರ/.test(text)) return "land_record";
  if (/ಸುತ್ತೋಲೆ|circular/i.test(text)) return "circular";
  if (/ಮಾನ್ಯರೇ|ನಿಮ್ಮ ವಿಶ್ವಾಸಿ|ಪ್ರಿಯರೇ/.test(text)) return "letter";
  if (/ಪುಸ್ತಕ|ಅಧ್ಯಾಯ/.test(text)) return "book";
  if (/ಸೂಚನೆ|ಅಧಿಸೂಚನೆ|\bnotice\b/i.test(text)) return "notice";
  return "other";
}

function nearby(text: string, index: number, length: number): boolean {
  const window = text.slice(Math.max(0, index - 32), Math.min(text.length, index + length + 24));
  return DEADLINE_CUES.some((cue) => window.toLowerCase().includes(cue.toLowerCase()));
}

function monthIndex(name: string): number {
  const kn = KN_MONTHS.indexOf(name);
  if (kn >= 0) return kn;
  return EN_MONTHS.indexOf(name.toLowerCase());
}

export function dateSortKey(value: string): number | null {
  const folded = foldKannadaDigits(value);
  const numeric = folded.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
  if (numeric) {
    const day = Number(numeric[1]);
    const month = Number(numeric[2]);
    const year = Number(numeric[3]);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return Date.UTC(year, month - 1, day);
    }
  }
  const named = folded.match(
    new RegExp(`(\\d{1,2})\\s+(${[...KN_MONTHS, ...EN_MONTHS].join("|")})\\s+(\\d{4})`, "i"),
  );
  if (named) {
    const month = monthIndex(named[2]);
    if (month >= 0) return Date.UTC(Number(named[3]), month, Number(named[1]));
  }
  return null;
}

function latest(values: string[]): string | null {
  let best: { value: string; key: number } | null = null;
  for (const value of values) {
    const key = dateSortKey(value);
    if (key == null) continue;
    if (!best || key > best.key) best = { value, key };
  }
  return best?.value ?? values[values.length - 1] ?? null;
}

function collectDates(original: string, folded: string): { dates: string[]; deadlines: string[] } {
  const dates: string[] = [];
  const deadlines: string[] = [];
  const patterns = [
    new RegExp(`(\\d{1,2}\\s+(?:${KN_MONTHS.join("|")})\\s+\\d{4})`, "g"),
    new RegExp(`(\\d{1,2}\\s+(?:${EN_MONTHS.join("|")})\\s+\\d{4})`, "gi"),
    /\b(\d{1,2}[./-]\d{1,2}[./-]\d{4})\b/g,
  ];
  for (const pattern of patterns) {
    for (const match of folded.matchAll(pattern)) {
      const value = original.slice(match.index ?? 0, (match.index ?? 0) + match[0].length).trim();
      if (!value) continue;
      if (nearby(folded, match.index ?? 0, match[0].length)) deadlines.push(value);
      else dates.push(value);
    }
  }
  return { dates: unique(dates), deadlines: unique(deadlines) };
}

function collectAmounts(folded: string): string[] {
  const found = [
    ...folded.matchAll(/₹\s?[\d,]+(?:\.\d{1,2})?/g),
    ...folded.matchAll(/(?:ರೂ\.?|ರೂಪಾಯಿ|Rs\.?|INR)\s?[\d,]+(?:\.\d{1,2})?/gi),
    ...folded.matchAll(/[\d,]+\s*(?:ರೂಪಾಯಿ|ರೂ\.?)/g),
  ].map((match) => match[0].replace(/\s+/g, " ").trim());
  return unique(found);
}

function collectReferences(folded: string): string[] {
  const labeled = [
    ...folded.matchAll(
      /(?:ಸುತ್ತೋಲೆ ಸಂಖ್ಯೆ|ಸೂಚನೆ ಸಂಖ್ಯೆ|ಪತ್ರ ಸಂಖ್ಯೆ|ಖಾತೆ ಸಂಖ್ಯೆ|ಸರ್ವೆ ಸಂಖ್ಯೆ|ದೂರವಾಣಿ)\s*[:：]?\s*(\S{2,40})/g,
    ),
  ].map((match) => match[1]);
  const phones = [...folded.matchAll(/\b\d{3,5}[- ]\d{3,5}[- ]\d{3,5}\b/g)].map((match) => match[0]);
  return unique([...labeled, ...phones]);
}

function collectNames(original: string): string[] {
  return unique(
    [...original.matchAll(/(?:ಖಾತೆದಾರರ ಹೆಸರು|ವೈದ್ಯರ ಹೆಸರು)\s*[:：]\s*(.+)/g)].map((match) =>
      match[1].trim(),
    ),
  );
}

function collectOffices(original: string): string[] {
  const lines = original
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const hits = lines.filter(
    (line) => /ಕಚೇರಿ|ಪಂಚಾಯಿತಿ|ಆಸ್ಪತ್ರೆ|ಶಾಲೆ|ಇಲಾಖೆ|ಹೋಬಳಿ/.test(line) && line.length <= 80,
  );
  const quieter = hits.filter((line) => !/ಬೇಕು|ಬನ್ನಿ|ಸಲ್ಲಿಸ/.test(line));
  return unique(quieter.length ? quieter : hits).slice(0, 2);
}

function collectActions(original: string): string[] {
  return unique(
    sentences(original).filter((sentence) =>
      /ಸಲ್ಲಿಸ|ತುಂಬಿಸ|ಹಾಜರ|ಪಾವತ|ಕೊಡಿ|ಬನ್ನಿ|ಒಯ್ಯ|ತನ್ನಿ|apply|submit|attend|pay|bring/i.test(sentence),
    ),
  )
    .map((sentence) => (sentence.length > 160 ? `${sentence.slice(0, 157)}...` : sentence))
    .slice(0, 2);
}

function kannadaSummary(original: string): string {
  const picked = sentences(original).slice(0, 4);
  if (picked.length === 0) return "ಪಠ್ಯ ಖಾಲಿ ಇದೆ.";
  return picked.join(" ");
}

function englishSummary(docType: DocType, facts: Fact[]): string {
  const deadlines = facts.filter((fact) => fact.kind === "deadline").map((fact) => fact.value);
  const dates = facts.filter((fact) => fact.kind === "date").map((fact) => fact.value);
  const amounts = facts.filter((fact) => fact.kind === "amount").map((fact) => fact.value);
  const actions = facts.filter((fact) => fact.kind === "action").map((fact) => fact.value);
  const offices = facts.filter((fact) => fact.kind === "office").map((fact) => fact.value);
  const bits = [`This looks like ${DOC_TYPE_EN[docType]}.`];
  if (deadlines.length) bits.push(`Deadline: ${deadlines.join(", ")}.`);
  else if (dates.length) bits.push(`Dates mentioned: ${dates.join(", ")}.`);
  if (amounts.length) bits.push(`Amounts: ${amounts.join(", ")}.`);
  if (offices.length) bits.push(`Office: ${offices[0]}.`);
  if (actions.length) bits.push(`What to do: ${actions[0]}`);
  if (bits.length === 1) bits.push("No dates, amounts, or actions were pulled out by the offline pass.");
  return bits.join(" ");
}

export function explainOffline(text: string): ExplainResult {
  const original = text.replace(/\r\n/g, "\n").trim();
  if (!original) {
    return {
      summaryKn: "ಪಠ್ಯ ಖಾಲಿ ಇದೆ.",
      summaryEn: "There is no text to explain.",
      docType: "other",
      facts: [],
    };
  }
  const folded = foldKannadaDigits(original);
  const docType = guessDocType(original);
  const { dates, deadlines } = collectDates(original, folded);
  const facts: Fact[] = [
    ...deadlines.map((value) => ({ kind: "deadline" as const, value })),
    ...dates.map((value) => ({ kind: "date" as const, value })),
    ...collectAmounts(folded).map((value) => ({ kind: "amount" as const, value })),
    ...collectOffices(original).map((value) => ({ kind: "office" as const, value })),
    ...collectReferences(folded).map((value) => ({ kind: "reference" as const, value })),
    ...collectNames(original).map((value) => ({ kind: "name" as const, value })),
    ...collectActions(original).map((value) => ({ kind: "action" as const, value })),
  ].slice(0, 12);
  return {
    summaryKn: kannadaSummary(original),
    summaryEn: englishSummary(docType, facts),
    docType,
    facts,
  };
}

function questionLanguage(question: string): "kn" | "en" {
  return /[\u0C80-\u0CFF]/.test(question) ? "kn" : "en";
}

const STOP = new Set([
  "the",
  "a",
  "an",
  "is",
  "are",
  "what",
  "whats",
  "who",
  "when",
  "where",
  "which",
  "do",
  "i",
  "me",
  "to",
  "of",
  "on",
  "in",
  "this",
  "that",
  "ಇದು",
  "ಏನು",
  "ಯಾವುದು",
  "ಯಾವ",
  "ನಾನು",
  "ಈ",
]);

export function answerOffline(
  text: string,
  question: string,
  explained?: ExplainResult,
): { answer: string; language: "kn" | "en" } {
  const language = questionLanguage(question);
  const base = explained ?? explainOffline(text);
  const q = question.trim();
  const byKind = (kind: Fact["kind"]) => base.facts.filter((fact) => fact.kind === kind).map((fact) => fact.value);

  const wantsDate = /ದಿನಾಂಕ|ದಿನ|ಯಾವಾಗ|ಕೊನೆ|date|when|deadline/i.test(q);
  const wantsAmount = /ಎಷ್ಟು|ಹಣ|ರೂಪಾಯಿ|ಮೊತ್ತ|amount|fee|₹|ಶುಲ್ಕ/i.test(q);
  const wantsAction = /ಮಾಡಬೇಕು|ಏನು ಮಾಡ|ಕ್ರಮ|what should|what do|action/i.test(q);
  const wantsOffice = /ಎಲ್ಲಿ|ಕಚೇರಿ|where|office/i.test(q);
  const wantsName = /ಯಾರು|ಹೆಸರು|\bwho\b|\bname\b/i.test(q);
  const wantsType = /ಯಾವ ದಾಖಲೆ|what kind|document type|ಏನು ಇದು/i.test(q);

  const say = (kn: string, en: string) => (language === "kn" ? kn : en);
  const missing = say(
    "ಈ ಪುಟದಲ್ಲಿ ಅದಕ್ಕೆ ಸ್ಪಷ್ಟ ಉತ್ತರ ಸಿಗಲಿಲ್ಲ.",
    "This page does not state a clear answer.",
  );

  if (wantsDate) {
    const deadlines = byKind("deadline");
    const dates = byKind("date");
    const pool = deadlines.length ? deadlines : dates;
    if (pool.length === 0) return { answer: missing, language };
    const wantsLast = /ಕೊನೆ|last|final|due/i.test(q);
    const picked = wantsLast ? latest(pool) : pool.join(", ");
    return {
      answer: say(`ಕೊನೆಯ ದಿನಾಂಕ: ${picked}.`, `The last date in this page: ${picked}.`),
      language,
    };
  }

  if (wantsAmount) {
    const amounts = byKind("amount");
    if (!amounts.length) return { answer: missing, language };
    return { answer: say(`ಮೊತ್ತ: ${amounts.join(", ")}.`, `Amount: ${amounts.join(", ")}.`), language };
  }

  if (wantsAction) {
    const actions = byKind("action");
    if (!actions.length) return { answer: missing, language };
    return {
      answer: say(`ಮಾಡಬೇಕಾದ್ದು: ${actions[0]}`, `What to do: ${actions[0]}`),
      language,
    };
  }

  if (wantsOffice) {
    const offices = byKind("office");
    if (!offices.length) return { answer: missing, language };
    return { answer: say(`ಕಚೇರಿ: ${offices[0]}`, `Office: ${offices[0]}`), language };
  }

  if (wantsName) {
    const names = byKind("name");
    if (!names.length) return { answer: missing, language };
    return { answer: say(`ಹೆಸರು: ${names.join(", ")}.`, `Name: ${names.join(", ")}.`), language };
  }

  if (wantsType) {
    const labels: Record<DocType, [string, string]> = {
      circular: ["ಇದು ಸುತ್ತೋಲೆ.", "This is a circular."],
      land_record: ["ಇದು ಭೂ ದಾಖಲೆ.", "This is a land record extract."],
      notice: ["ಇದು ಸೂಚನೆ.", "This is a notice."],
      letter: ["ಇದು ಪತ್ರ.", "This is a letter."],
      book: ["ಇದು ಪುಸ್ತಕದ ಪುಟ.", "This is a book page."],
      other: ["ದಾಖಲೆಯ ಬಗೆ ಸ್ಪಷ್ಟವಿಲ್ಲ.", "The document type is not clear."],
    };
    const [kn, en] = labels[base.docType];
    return { answer: say(kn, en), language };
  }

  const tokens = q
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.replace(/[?？.,।]/g, ""))
    .filter((token) => token.length > 1 && !STOP.has(token));
  if (tokens.length) {
    const corpus = sentences(`${text}\n${base.summaryKn}\n${base.summaryEn}`);
    let best = "";
    let bestScore = 0;
    for (const sentence of corpus) {
      const folded = sentence.toLowerCase();
      const score = tokens.filter((token) => folded.includes(token)).length;
      if (score > bestScore) {
        best = sentence;
        bestScore = score;
      }
    }
    if (best && bestScore > 0) return { answer: best, language };
  }

  return { answer: missing, language };
}
