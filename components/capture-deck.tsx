"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { samples } from "@/lib/samples";
import type { Copy } from "@/lib/i18n";
import type { Sample } from "@/lib/types";

export function CaptureDeck({
  t,
  busy,
  onFile,
  onSample,
  onCamera,
}: {
  t: Copy;
  busy: boolean;
  onFile: (file: File) => void;
  onSample: (sample: Sample) => void;
  onCamera: () => void;
}) {
  const photoRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="space-y-3">
        <h1 className="font-heading text-4xl leading-tight text-balance sm:text-5xl">{t.tagline}</h1>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground">{t.hero}</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" className="h-11 px-4 text-base" disabled={busy} onClick={() => photoRef.current?.click()}>
          {t.takePhoto}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="h-11 px-4 text-base"
          disabled={busy}
          onClick={() => uploadRef.current?.click()}
        >
          {t.upload}
        </Button>
        <Button type="button" variant="outline" className="h-11 px-4 text-base" disabled={busy} onClick={onCamera}>
          {t.camera}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">{t.pdfNote}</p>
      <label
        className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/70 px-4 py-8 text-center text-sm text-muted-foreground"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer.files?.[0];
          if (file) onFile(file);
        }}
      >
        {t.drop}
        <input
          ref={uploadRef}
          className="sr-only"
          type="file"
          accept="image/*,application/pdf"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) onFile(file);
          }}
        />
      </label>
      <input
        ref={photoRef}
        className="sr-only"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) onFile(file);
        }}
      />
      <div className="space-y-2">
        <div>
          <h2 className="text-sm font-medium">{t.samplesTitle}</h2>
          <p className="text-sm text-muted-foreground">{t.samplesHint}</p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {samples.map((sample) => (
            <Button
              key={sample.id}
              type="button"
              variant="outline"
              className="h-auto shrink-0 flex-col items-start gap-0 px-3 py-2 text-left"
              disabled={busy}
              onClick={() => onSample(sample)}
            >
              <span className="text-[11px] tracking-wide text-muted-foreground">{sample.titleEn}</span>
              <span className="text-base">{sample.titleKn}</span>
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
