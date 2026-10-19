"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArchiveView } from "@/components/archive-view";
import { CameraDialog } from "@/components/camera-dialog";
import { CaptureDeck } from "@/components/capture-deck";
import { ReaderWorkspace, type ReaderDoc } from "@/components/reader-workspace";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { deleteDocument, listDocuments, saveDocument } from "@/lib/db";
import { blobToBase64, compressImage, matchSample, rasterizePdf } from "@/lib/files";
import { messages, type Lang } from "@/lib/i18n";
import { explainOffline, answerOffline } from "@/lib/offline";
import { recognizeKannada } from "@/lib/ocr-browser";
import { playClips, speakWithBrowser, stopSpeaking, type SpeechClip } from "@/lib/speech";
import { titleFromText } from "@/lib/title";
import type { ExplainResult, ProviderStatus, Sample, SavedDoc } from "@/lib/types";

type View = "read" | "archive";
type Busy = "reading" | "explaining" | null;

function toSaved(doc: ReaderDoc, createdAt: number): SavedDoc {
  return {
    ...doc,
    createdAt,
    updatedAt: Date.now(),
    image: doc.imageBlob,
    sampleId: doc.id.startsWith("sample:") ? doc.id.slice(7) : undefined,
  };
}

async function explainText(text: string): Promise<{ provider: string; result: ExplainResult }> {
  try {
    const response = await fetch("/api/explain", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (response.ok) {
      const data = (await response.json()) as { ok?: boolean; provider?: string; result?: ExplainResult };
      if (data.ok && data.result && data.provider) return { provider: data.provider, result: data.result };
    }
  } catch {
    /* local fallback */
  }
  return { provider: "offline", result: explainOffline(text) };
}

export function OduApp() {
  const [lang, setLang] = useState<Lang>("en");
  const [view, setView] = useState<View>("read");
  const [status, setStatus] = useState<ProviderStatus | null>(null);
  const [archive, setArchive] = useState<SavedDoc[]>([]);
  const [archiveReady, setArchiveReady] = useState(false);
  const [storageBlocked, setStorageBlocked] = useState(false);
  const [doc, setDoc] = useState<ReaderDoc | null>(null);
  const [busy, setBusy] = useState<Busy>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voice, setVoice] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const createdAt = useRef(0);
  const [retryBlob, setRetryBlob] = useState<Blob | null>(null);
  const t = messages(lang);

  useEffect(() => {
    const saved = window.localStorage.getItem("odu-lang");
    const next: Lang =
      saved === "kn" || saved === "en" ? saved : navigator.language.toLowerCase().startsWith("kn") ? "kn" : "en";
    const timer = window.setTimeout(() => setLang(next), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    window.localStorage.setItem("odu-lang", lang);
  }, [lang]);

  useEffect(() => {
    let cancel = false;
    void (async () => {
      try {
        const [statusRes, docs] = await Promise.all([
          fetch("/api/status").then((response) => response.json() as Promise<ProviderStatus>),
          listDocuments(),
        ]);
        if (cancel) return;
        setStatus(statusRes);
        setArchive(docs);
      } catch {
        if (!cancel) setStorageBlocked(true);
      } finally {
        if (!cancel) setArchiveReady(true);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  useEffect(() => () => stopSpeaking(), []);

  const persist = useCallback(async (next: ReaderDoc) => {
    if (!next.text.trim()) return;
    try {
      setSaveState("saving");
      await saveDocument(toSaved(next, createdAt.current));
      setArchive(await listDocuments());
      setSaveState("saved");
    } catch {
      setSaveState("error");
      setStorageBlocked(true);
    }
  }, []);

  useEffect(() => {
    if (!doc?.text.trim()) return;
    const snapshot = doc;
    const handle = window.setTimeout(() => {
      void persist(snapshot);
    }, 700);
    return () => window.clearTimeout(handle);
  }, [doc, persist]);

  function openPrepared(next: ReaderDoc) {
    createdAt.current = Date.now();
    setDoc(next);
    setAnswer("");
    setQuestion("");
    setView("read");
    setError(null);
    void persist(next);
  }

  function openSample(sample: Sample, imageBlob: Blob) {
    openPrepared({
      id: `sample:${sample.id}`,
      title: sample.titleKn,
      text: sample.text,
      imageBlob,
      docType: sample.docType,
      summaryKn: sample.summaryKn,
      summaryEn: sample.summaryEn,
      facts: sample.facts,
      ocrProvider: "sample",
      explainProvider: "sample",
    });
  }

  async function onSample(sample: Sample) {
    setBusy("reading");
    setError(null);
    try {
      const response = await fetch(sample.file);
      if (!response.ok) throw new Error("sample missing");
      const blob = await response.blob();
      openSample(sample, blob);
    } catch {
      setError(t.ocrError);
    } finally {
      setBusy(null);
    }
  }

  async function runFile(file: Blob) {
    setRetryBlob(file);
    setBusy("reading");
    setProgress(null);
    setError(null);
    setView("read");
    try {
      let image = file;
      if (file.type === "application/pdf" || (file instanceof File && file.name.toLowerCase().endsWith(".pdf"))) {
        image = await rasterizePdf(file);
      }
      const sample = await matchSample(file.type === "application/pdf" ? image : file);
      if (sample) {
        openSample(sample, image);
        return;
      }
      const prepared = await compressImage(image);
      setDoc({
        id: crypto.randomUUID(),
        title: "",
        text: "",
        imageBlob: image,
        docType: "other",
        summaryKn: "",
        summaryEn: "",
        facts: [],
        ocrProvider: "tesseract",
        explainProvider: "offline",
      });
      let text = "";
      let ocrProvider = "tesseract";
      try {
        const base64 = await blobToBase64(prepared);
        const response = await fetch("/api/ocr", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ mime: prepared.type || "image/jpeg", base64 }),
        });
        if (response.ok) {
          const data = (await response.json()) as { ok?: boolean; text?: string; provider?: string };
          if (data.ok && data.text?.trim() && data.provider) {
            text = data.text.trim();
            ocrProvider = data.provider;
          }
        }
      } catch {
        /* browser OCR next */
      }
      if (!text) {
        text = await recognizeKannada(prepared, setProgress);
        ocrProvider = "tesseract";
      }
      if (!text.trim()) throw new Error("empty");
      setBusy("explaining");
      const explained = await explainText(text);
      const next: ReaderDoc = {
        id: crypto.randomUUID(),
        title: titleFromText(text),
        text,
        imageBlob: image,
        docType: explained.result.docType,
        summaryKn: explained.result.summaryKn,
        summaryEn: explained.result.summaryEn,
        facts: explained.result.facts,
        ocrProvider,
        explainProvider: explained.provider,
      };
      openPrepared(next);
    } catch {
      setError(t.ocrError);
      setDoc((current) => (current?.text ? current : null));
    } finally {
      setBusy(null);
      setProgress(null);
    }
  }

  async function onExplain() {
    if (!doc?.text.trim()) return;
    setBusy("explaining");
    const explained = await explainText(doc.text);
    const next: ReaderDoc = {
      ...doc,
      title: titleFromText(doc.text),
      docType: explained.result.docType,
      summaryKn: explained.result.summaryKn,
      summaryEn: explained.result.summaryEn,
      facts: explained.result.facts,
      explainProvider: explained.provider,
    };
    setDoc(next);
    setBusy(null);
    void persist(next);
  }

  async function onAsk(value: string) {
    const q = value.trim();
    if (!q || !doc) return;
    setAsking(true);
    setAnswer("");
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          text: doc.text,
          question: q,
          summaryKn: doc.summaryKn,
          summaryEn: doc.summaryEn,
        }),
      });
      if (response.ok) {
        const data = (await response.json()) as { ok?: boolean; answer?: string };
        if (data.ok && data.answer) {
          setAnswer(data.answer);
          return;
        }
      }
    } catch {
      /* local answer */
    } finally {
      setAsking(false);
    }
    const local = answerOffline(doc.text, q, {
      summaryKn: doc.summaryKn,
      summaryEn: doc.summaryEn,
      docType: doc.docType,
      facts: doc.facts,
    });
    setAnswer(local.answer);
    setAsking(false);
  }

  async function onListen(text: string) {
    stopSpeaking();
    setSpeaking(true);
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (response.ok) {
        const data = (await response.json()) as { ok?: boolean; clips?: SpeechClip[] };
        if (data.ok && data.clips?.length) {
          setVoice("sarvam");
          await playClips(data.clips, () => setSpeaking(false));
          return;
        }
      }
    } catch {
      /* browser voice */
    }
    setVoice("browser");
    await speakWithBrowser(text, () => setSpeaking(false));
  }

  function onText(text: string) {
    setDoc((current) => (current ? { ...current, text, title: titleFromText(text) } : current));
  }

  const saveLabel =
    saveState === "saving" ? t.saving : saveState === "error" ? t.saveFailed : saveState === "saved" ? t.saved : t.localOnly;

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between gap-3">
            <button type="button" className="flex items-baseline gap-2 text-left" onClick={() => setView("read")}>
              <span className="font-heading text-2xl leading-none">{t.appName}</span>
              <span className="text-sm text-muted-foreground">{t.appMark}</span>
            </button>
            <div className="flex rounded-full bg-muted p-1 sm:hidden">
              <LangButtons lang={lang} setLang={setLang} />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill lang={lang} status={status} />
            <div className="hidden rounded-full bg-muted p-1 sm:flex">
              <LangButtons lang={lang} setLang={setLang} />
            </div>
            <div className="flex rounded-full bg-card p-1 ring-1 ring-foreground/10">
              <Button type="button" variant={view === "read" ? "default" : "ghost"} className="h-8" onClick={() => setView("read")}>
                {t.read}
              </Button>
              <Button
                type="button"
                variant={view === "archive" ? "default" : "ghost"}
                className="h-8"
                onClick={() => {
                  if (doc?.text.trim()) void persist(doc);
                  setView("archive");
                }}
              >
                {t.archive}
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6">
        {storageBlocked ? (
          <p className="mb-4 rounded-xl bg-accent px-3 py-2 text-sm text-accent-foreground">{t.storageBlocked}</p>
        ) : null}
        {error ? (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <span>{error}</span>
            {retryBlob ? (
              <Button type="button" variant="outline" className="h-8" onClick={() => void runFile(retryBlob)}>
                {t.retry}
              </Button>
            ) : null}
          </div>
        ) : null}
        {view === "archive" ? (
          <ArchiveView
            t={t}
            lang={lang}
            docs={archive}
            loading={!archiveReady}
            onOpen={(saved) => {
              createdAt.current = saved.createdAt;
              setDoc({
                id: saved.id,
                title: saved.title,
                text: saved.text,
                imageBlob: saved.image,
                docType: saved.docType,
                summaryKn: saved.summaryKn,
                summaryEn: saved.summaryEn,
                facts: saved.facts,
                ocrProvider: saved.ocrProvider,
                explainProvider: saved.explainProvider,
              });
              setAnswer("");
              setView("read");
              setSaveState("saved");
            }}
            onDelete={(id) => {
              void deleteDocument(id).then(() => listDocuments().then(setArchive));
              if (doc?.id === id) setDoc(null);
            }}
          />
        ) : doc && (doc.text || busy === "reading") ? (
          <ReaderWorkspace
            t={t}
            lang={lang}
            doc={doc}
            busy={busy}
            progress={progress}
            asking={asking}
            answer={answer}
            question={question}
            speaking={speaking}
            voice={voice}
            saveLabel={saveLabel}
            onText={onText}
            onBlurText={() => {
              if (doc?.text.trim()) void persist(doc);
            }}
            onExplain={() => void onExplain()}
            onQuestion={setQuestion}
            onAsk={(value) => void onAsk(value)}
            onListen={(text) => void onListen(text)}
            onStop={() => {
              stopSpeaking();
              setSpeaking(false);
            }}
            onClear={() => {
              if (doc) void persist({ ...doc, text: doc.text, title: titleFromText(doc.text) });
              setDoc(null);
            }}
          />
        ) : (
          <CaptureDeck
            t={t}
            busy={busy != null}
            onFile={(file) => void runFile(file)}
            onSample={(sample) => void onSample(sample)}
            onCamera={() => setCameraOpen(true)}
          />
        )}
        {busy === "reading" && !doc ? <p className="mt-4 text-sm text-muted-foreground">{t.reading}</p> : null}
      </main>
      <footer className="mx-auto w-full max-w-6xl px-4 py-8 text-xs leading-5 text-muted-foreground">{t.footer}</footer>
      <CameraDialog open={cameraOpen} onOpenChange={setCameraOpen} onCapture={(blob) => void runFile(blob)} t={t} />
    </div>
  );
}

function LangButtons({ lang, setLang }: { lang: Lang; setLang: (lang: Lang) => void }) {
  return (
    <>
      <button
        type="button"
        className={`rounded-full px-3 py-1 text-sm ${lang === "kn" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
        aria-pressed={lang === "kn"}
        onClick={() => setLang("kn")}
      >
        ಕನ್ನಡ
      </button>
      <button
        type="button"
        className={`rounded-full px-3 py-1 text-sm ${lang === "en" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
        aria-pressed={lang === "en"}
        onClick={() => setLang("en")}
      >
        English
      </button>
    </>
  );
}
