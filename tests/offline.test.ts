import { describe, expect, it } from "vitest";
import { explainOffline, answerOffline, dateSortKey } from "@/lib/offline";
import { samples } from "@/lib/samples";
import { titleFromText } from "@/lib/title";

const pension = samples.find((sample) => sample.id === "pension-circular");
const letter = samples.find((sample) => sample.id === "clinic-letter");

describe("explainOffline", () => {
  it("labels every bundled sample with the same document type", () => {
    for (const sample of samples) {
      expect(explainOffline(sample.text).docType).toBe(sample.docType);
    }
  });

  it("pulls the pension deadline and rupee amount", () => {
    expect(pension).toBeTruthy();
    const result = explainOffline(pension!.text);
    expect(result.facts.some((fact) => fact.kind === "deadline" && fact.value.includes("30"))).toBe(true);
    expect(result.facts.some((fact) => fact.kind === "amount" && fact.value.includes("1,200"))).toBe(true);
    expect(result.summaryEn.toLowerCase()).toContain("circular");
    expect(result.summaryKn.length).toBeGreaterThan(20);
  });

  it("reads a numeric date and a clinic amount", () => {
    const result = explainOffline("ದಿನಾಂಕ 09/03/2026 ರೊಳಗೆ ₹350 ಕೊಡಿ");
    expect(result.facts.some((fact) => fact.kind === "deadline" && fact.value.includes("09/03/2026"))).toBe(true);
    expect(result.facts.some((fact) => fact.kind === "amount" && fact.value.includes("350"))).toBe(true);
  });

  it("sorts a Kannada month date", () => {
    expect(dateSortKey("30 ನವೆಂಬರ್ 2026")).toBe(Date.UTC(2026, 10, 30));
  });

  it("stays quiet on an empty page", () => {
    const result = explainOffline("  ");
    expect(result.docType).toBe("other");
    expect(result.facts).toEqual([]);
  });
});

describe("answerOffline", () => {
  it("answers a Kannada date question from the circular", () => {
    const explained = explainOffline(pension!.text);
    const answer = answerOffline(pension!.text, "ಕೊನೆಯ ದಿನಾಂಕ ಯಾವುದು?", explained);
    expect(answer.language).toBe("kn");
    expect(answer.answer).toContain("30");
  });

  it("answers an English action question in English", () => {
    const explained = explainOffline(pension!.text);
    const answer = answerOffline(pension!.text, "what should I do?", explained);
    expect(answer.language).toBe("en");
    expect(answer.answer.toLowerCase()).toContain("what to do");
  });

  it("answers the clinic amount", () => {
    const explained = explainOffline(letter!.text);
    const answer = answerOffline(letter!.text, "ಎಷ್ಟು ಹಣ?", explained);
    expect(answer.language).toBe("kn");
    expect(answer.answer).toContain("350");
  });
});

describe("titleFromText", () => {
  it("skips the fictional banner line", () => {
    expect(titleFromText("ಕಾಲ್ಪನಿಕ ಮಾದರಿ\nಹಸಿರುಕೆರೆ ಗ್ರಾಮ ಪಂಚಾಯಿತಿ")).toBe("ಹಸಿರುಕೆರೆ ಗ್ರಾಮ ಪಂಚಾಯಿತಿ");
  });
});
