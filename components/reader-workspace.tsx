"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useObjectUrl } from "@/components/use-object-url";
import { docTypeLabel, factKindLabel, providerName, type Copy, type Lang } from "@/lib/i18n";
import type { DocType, Fact } from "@/lib/types";

export type ReaderDoc = {
  id: string;
  title: string;
  text: string;
  imageBlob: Blob;
  docType: DocType;
  summaryKn: string;
  summaryEn: string;
  facts: Fact[];
  ocrProvider: string;
  explainProvider: string;
};

export function ReaderWorkspace({
  t,
  lang,
  doc,
  busy,
  progress,
  asking,
  answer,
  question,
  speaking,
  voice,
  saveLabel,
  onText,
  onBlurText,
  onExplain,
  onQuestion,
  onAsk,
  onListen,
  onStop,
  onClear,
}: {
  t: Copy;
  lang: Lang;
  doc: ReaderDoc;
  busy: "reading" | "explaining" | null;
  progress: number | null;
  asking: boolean;
  answer: string;
  question: string;
  speaking: boolean;
  voice: string;
  saveLabel: string;
  onText: (text: string) => void;
  onBlurText: () => void;
  onExplain: () => void;
  onQuestion: (value: string) => void;
  onAsk: (value: string) => void;
  onListen: (text: string) => void;
  onStop: () => void;
  onClear: () => void;
}) {
  const imageUrl = useObjectUrl(doc.imageBlob);
  const suggestions = [t.questionKn1, t.questionKn2, t.questionEn1, t.questionEn2];

  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(260px,0.9fr)_minmax(0,1.15fr)]">
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
          {imageUrl ? (
            // Blob URLs are created in the browser, so next/image cannot optimize them.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={t.pageAlt} className="max-h-[70vh] w-full object-contain bg-[#efe6d6]" />
          ) : null}
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>{saveLabel}</span>
          <Button type="button" variant="ghost" className="h-8 px-2" onClick={onClear}>
            {t.clear}
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <label htmlFor="odu-text" className="text-sm font-medium">
              {t.textLabel}
            </label>
            <Badge variant="secondary">{providerName(lang, doc.ocrProvider)}</Badge>
            {busy === "reading" ? <span className="text-xs text-muted-foreground">{t.reading}</span> : null}
          </div>
          {busy === "reading" && doc.ocrProvider === "tesseract" ? (
            <p className="mb-2 text-sm text-muted-foreground">
              {t.browserOcr}
              {progress != null ? ` ${Math.round(progress * 100)}%` : ""}
            </p>
          ) : null}
          <Textarea
            id="odu-text"
            value={doc.text}
            onChange={(event) => onText(event.target.value)}
            onBlur={onBlurText}
            className="min-h-72 text-lg leading-8 md:text-lg"
            aria-describedby="odu-text-hint"
          />
          <p id="odu-text-hint" className="mt-2 text-xs text-muted-foreground">
            {t.textHint}
          </p>
        </div>

        <div className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-medium">{t.explainTitle}</h2>
            <Badge variant={doc.explainProvider === "offline" ? "outline" : "secondary"}>
              {doc.explainProvider === "offline" ? t.offline : providerName(lang, doc.explainProvider)}
            </Badge>
            <Badge variant="outline">{docTypeLabel[lang][doc.docType] ?? doc.docType}</Badge>
          </div>
          {busy === "explaining" ? <p className="text-sm text-muted-foreground">{t.explaining}</p> : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <h3 className="mb-1 text-xs text-muted-foreground">{t.summaryKn}</h3>
              <p className="text-base leading-7 whitespace-pre-wrap">{doc.summaryKn}</p>
            </div>
            <div>
              <h3 className="mb-1 text-xs text-muted-foreground">{t.summaryEn}</h3>
              <p className="text-base leading-7 whitespace-pre-wrap">{doc.summaryEn}</p>
            </div>
          </div>
          <h3 className="mt-4 mb-2 text-xs text-muted-foreground">{t.facts}</h3>
          {doc.facts.length ? (
            <ul className="flex flex-wrap gap-2">
              {doc.facts.map((fact, index) => (
                <li key={`${fact.kind}-${index}`} className="max-w-full rounded-full bg-secondary px-3 py-1 text-sm">
                  <span className="text-muted-foreground">{factKindLabel[lang][fact.kind] ?? fact.kind}: </span>
                  {fact.value}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">{t.factsEmpty}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" variant="secondary" className="h-10" onClick={onExplain} disabled={busy != null}>
              {t.explainAgain}
            </Button>
            <Button
              type="button"
              className="h-10"
              onClick={() => (speaking ? onStop() : onListen(doc.summaryKn || doc.text))}
            >
              {speaking ? t.stop : t.listenSummary}
            </Button>
            <Button type="button" variant="outline" className="h-10" onClick={() => (speaking ? onStop() : onListen(doc.text))}>
              {speaking ? t.stop : t.listenFull}
            </Button>
            {voice ? <span className="self-center text-xs text-muted-foreground">{t.voiceLabel}: {providerName(lang, voice)}</span> : null}
          </div>
        </div>

        <form
          className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10"
          onSubmit={(event) => {
            event.preventDefault();
            onAsk(question);
          }}
        >
          <h2 className="mb-2 text-sm font-medium">{t.askTitle}</h2>
          <div className="mb-2 flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="rounded-full bg-muted px-3 py-1 text-left text-sm hover:bg-secondary"
                onClick={() => {
                  onQuestion(suggestion);
                  onAsk(suggestion);
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="sr-only" htmlFor="odu-ask">
              {t.askTitle}
            </label>
            <Input
              id="odu-ask"
              value={question}
              placeholder={t.askPlaceholder}
              className="h-11 text-base md:text-base"
              onChange={(event) => onQuestion(event.target.value)}
            />
            <Button type="submit" className="h-11 px-4" disabled={asking || !question.trim()}>
              {asking ? t.asking : t.ask}
            </Button>
          </div>
          {answer ? (
            <p className="mt-3 text-base leading-7 whitespace-pre-wrap" aria-live="polite">
              {answer}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
