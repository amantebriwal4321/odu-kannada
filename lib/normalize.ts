const INVISIBLE = /[\u200B\u200C\u200D\uFEFF\u00AD]/g;
const KN_DIGITS = "೦೧೨೩೪೫೬೭೮೯";

export function foldKannadaDigits(input: string): string {
  return input.replace(/[೦-೯]/g, (digit) => String(KN_DIGITS.indexOf(digit)));
}

/** NFC, drop ZWJ/ZWNJ and other invisible marks, collapse space, lowercase Latin. */
export function normalizeForSearch(input: string): string {
  return foldKannadaDigits(input)
    .normalize("NFC")
    .replace(INVISIBLE, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}
