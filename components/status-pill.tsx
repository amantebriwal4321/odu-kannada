"use client";

import type { ProviderStatus } from "@/lib/types";
import { statusLine, type Lang } from "@/lib/i18n";

export function StatusPill({ lang, status }: { lang: Lang; status: ProviderStatus | null }) {
  const live = Boolean(status && (status.keys.sarvam || status.keys.gemini));
  return (
    <p
      className={`inline-flex max-w-full items-center rounded-full px-3 py-1 text-xs leading-5 ${
        live ? "bg-primary/10 text-primary" : "bg-accent text-accent-foreground"
      }`}
    >
      {statusLine(lang, status)}
    </p>
  );
}
