export function titleFromText(text: string): string {
  const lines = text
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const line = lines.find((item) => item !== "ಕಾಲ್ಪನಿಕ ಮಾದರಿ" && item.length > 2);
  return (line ?? lines[0] ?? "ಓದು").slice(0, 80);
}
