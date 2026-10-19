import type { ProviderStatus } from "@/lib/types";

export function configuredProviders(env: {
  sarvam?: string | null;
  gemini?: string | null;
}): ProviderStatus {
  const sarvam = Boolean(env.sarvam && env.sarvam.trim());
  const gemini = Boolean(env.gemini && env.gemini.trim());
  return {
    keys: { sarvam, gemini },
    ocr: sarvam ? "sarvam" : gemini ? "gemini" : "tesseract",
    explain: gemini ? "gemini" : sarvam ? "sarvam" : "offline",
    tts: sarvam ? "sarvam" : "browser",
  };
}

export function geminiModel(envValue?: string | null): string {
  const trimmed = envValue?.trim();
  return trimmed || "gemini-3.8-flash";
}
