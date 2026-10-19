import { normalizeForSearch } from "@/lib/normalize";
import type { Fact } from "@/lib/types";

export type SearchDoc = {
  title: string;
  text: string;
  summaryKn: string;
  summaryEn: string;
  facts: Fact[];
};

export function searchHaystack(doc: SearchDoc): string {
  const factText = doc.facts.map((fact) => fact.value).join(" ");
  return normalizeForSearch(
    [doc.title, doc.text, doc.summaryKn, doc.summaryEn, factText].join("\n"),
  );
}

/** Empty query matches everything. Tokens must all appear after Kannada normalization. */
export function matchesQuery(doc: SearchDoc, query: string): boolean {
  const needle = normalizeForSearch(query);
  if (!needle) return true;
  const hay = searchHaystack(doc);
  if (hay.includes(needle)) return true;
  const tokens = needle.split(" ").filter(Boolean);
  return tokens.length > 0 && tokens.every((token) => hay.includes(token));
}
