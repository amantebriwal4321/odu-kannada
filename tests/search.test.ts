import { describe, expect, it } from "vitest";
import { normalizeForSearch } from "@/lib/normalize";
import { matchesQuery } from "@/lib/search";
import type { SearchDoc } from "@/lib/search";

const doc: SearchDoc = {
  title: "ನೀರು",
  text: "ಕರ್ನಾಟಕದ ಸೂಚನೆ ಇಲ್ಲಿ ಇದೆ",
  summaryKn: "ನೀರಿನ ಟ್ಯಾಂಕ್",
  summaryEn: "Water tank cleaning deadline is Friday",
  facts: [{ kind: "deadline", value: "18 ಅಕ್ಟೋಬರ್ 2026" }],
};

describe("normalizeForSearch", () => {
  it("strips ZWJ and ZWNJ so the same word matches", () => {
    const stored = "ಕರ್ನಾಟಕ";
    const withZwj = "ಕರ್\u200Dನಾಟಕ";
    const withZwnj = "ಕರ್\u200Cನಾಟಕ";
    expect(normalizeForSearch(withZwj)).toBe(normalizeForSearch(stored));
    expect(normalizeForSearch(withZwnj)).toBe(normalizeForSearch(stored));
  });

  it("folds NFC and NFD to the same string", () => {
    const word = "ಕನ್ನಡ";
    expect(normalizeForSearch(word.normalize("NFD"))).toBe(normalizeForSearch(word.normalize("NFC")));
  });

  it("folds Kannada digits and case", () => {
    expect(normalizeForSearch("ಮೊತ್ತ ೧೨೦೦")).toBe(normalizeForSearch("ಮೊತ್ತ 1200"));
    expect(normalizeForSearch("Deadline")).toBe("deadline");
  });
});

describe("matchesQuery", () => {
  it("matches an empty query", () => {
    expect(matchesQuery(doc, "   ")).toBe(true);
  });

  it("matches Kannada with a ZWJ typed into the query", () => {
    expect(matchesQuery(doc, "ಕರ್\u200Dನಾಟಕ")).toBe(true);
  });

  it("matches the English summary and fact chips", () => {
    expect(matchesQuery(doc, "deadline")).toBe(true);
    expect(matchesQuery(doc, "ಅಕ್ಟೋಬರ್")).toBe(true);
    expect(matchesQuery(doc, "water friday")).toBe(true);
  });

  it("rejects a query that is not in the page", () => {
    expect(matchesQuery(doc, "zzzz-nope")).toBe(false);
  });
});
