"use client";

export type SpeechClip = { audioBase64: string; mime: string };

function chunkForBrowser(text: string): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= 180) return clean ? [clean] : [];
  const parts: string[] = [];
  let rest = clean;
  while (rest.length > 180) {
    let cut = Math.max(rest.lastIndexOf("।", 180), rest.lastIndexOf(". ", 180), rest.lastIndexOf(" ", 180));
    if (cut < 60) cut = 180;
    parts.push(rest.slice(0, cut + 1).trim());
    rest = rest.slice(cut + 1).trim();
  }
  if (rest) parts.push(rest);
  return parts;
}

function waitForVoices(): Promise<SpeechSynthesisVoice[]> {
  const current = window.speechSynthesis.getVoices();
  if (current.length) return Promise.resolve(current);
  return new Promise((resolve) => {
    const timer = window.setTimeout(() => resolve(window.speechSynthesis.getVoices()), 500);
    window.speechSynthesis.addEventListener(
      "voiceschanged",
      () => {
        window.clearTimeout(timer);
        resolve(window.speechSynthesis.getVoices());
      },
      { once: true },
    );
  });
}

export function stopSpeaking(): void {
  window.speechSynthesis?.cancel();
}

export async function speakWithBrowser(text: string, onEnd: () => void): Promise<void> {
  const chunks = chunkForBrowser(text);
  if (!chunks.length || !window.speechSynthesis) {
    onEnd();
    return;
  }
  const voices = await waitForVoices();
  const voice = voices.find((item) => item.lang.toLowerCase().startsWith("kn"));
  window.speechSynthesis.cancel();
  chunks.forEach((chunk, index) => {
    const utterance = new SpeechSynthesisUtterance(chunk);
    utterance.lang = "kn-IN";
    utterance.rate = 0.92;
    if (voice) utterance.voice = voice;
    if (index === chunks.length - 1) utterance.onend = onEnd;
    window.speechSynthesis.speak(utterance);
  });
}

export async function playClips(clips: SpeechClip[], onEnd: () => void): Promise<void> {
  for (const clip of clips) {
    const audio = new Audio(`data:${clip.mime};base64,${clip.audioBase64}`);
    await new Promise<void>((resolve, reject) => {
      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error("Audio failed"));
      void audio.play().catch(reject);
    });
  }
  onEnd();
}
