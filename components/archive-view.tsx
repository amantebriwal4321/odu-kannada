"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useObjectUrl } from "@/components/use-object-url";
import { toMd, toSearchJson, toTxt, type ExportDoc } from "@/lib/export";
import { docTypeLabel, type Copy, type Lang } from "@/lib/i18n";
import { matchesQuery } from "@/lib/search";
import type { SavedDoc } from "@/lib/types";

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function asExport(doc: SavedDoc): ExportDoc {
  return {
    id: doc.id,
    title: doc.title,
    updatedAt: doc.updatedAt,
    docType: doc.docType,
    text: doc.text,
    summaryKn: doc.summaryKn,
    summaryEn: doc.summaryEn,
    facts: doc.facts,
    ocrProvider: doc.ocrProvider,
    explainProvider: doc.explainProvider,
  };
}

function safeName(id: string) {
  return id.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "page";
}

function Thumb({ blob, alt }: { blob: Blob; alt: string }) {
  const url = useObjectUrl(blob);
  if (!url) return <div className="h-16 w-12 rounded-md bg-muted" />;
  // Blob URLs are created in the browser, so next/image cannot optimize them.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={alt} className="h-16 w-12 rounded-md object-cover" />;
}

export function ArchiveView({
  t,
  lang,
  docs,
  loading,
  onOpen,
  onDelete,
}: {
  t: Copy;
  lang: Lang;
  docs: SavedDoc[];
  loading: boolean;
  onOpen: (doc: SavedDoc) => void;
  onDelete: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const filtered = useMemo(
    () => docs.filter((doc) => matchesQuery(doc, query)),
    [docs, query],
  );

  if (loading) return <p className="text-sm text-muted-foreground">{t.loadingArchive}</p>;

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl">{t.archive}</h1>
          <p className="text-sm text-muted-foreground">{t.localOnly}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-10"
          disabled={!docs.length}
          onClick={() => download("odu-archive.json", toSearchJson(docs.map(asExport)), "application/json")}
        >
          {t.exportAll}
        </Button>
      </div>
      <div>
        <label htmlFor="archive-search" className="sr-only">
          {t.archiveSearch}
        </label>
        <Input
          id="archive-search"
          value={query}
          placeholder={t.archiveSearch}
          className="h-11 text-base md:text-base"
          onChange={(event) => setQuery(event.target.value)}
        />
        <p className="mt-1 text-xs text-muted-foreground">{t.jsonNote}</p>
      </div>
      {!docs.length ? <p className="rounded-2xl bg-card p-6 text-sm ring-1 ring-foreground/10">{t.archiveEmpty}</p> : null}
      {docs.length > 0 && !filtered.length ? <p className="text-sm text-muted-foreground">{t.noMatch}</p> : null}
      <ul className="flex flex-col gap-3">
        {filtered.map((doc) => {
          const when = new Date(doc.updatedAt).toLocaleDateString(lang === "kn" ? "kn-IN" : "en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });
          const name = safeName(doc.id);
          return (
            <li key={doc.id} className="rounded-2xl bg-card p-3 ring-1 ring-foreground/10">
              <div className="flex gap-3">
                <Thumb blob={doc.image} alt={doc.title} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-base font-medium">{doc.title}</h2>
                    <Badge variant="outline">{docTypeLabel[lang][doc.docType] ?? doc.docType}</Badge>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{doc.summaryEn || doc.text}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{when}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" className="h-9" onClick={() => onOpen(doc)}>
                  {t.open}
                </Button>
                <Button type="button" variant="outline" className="h-9" onClick={() => download(`${name}.txt`, toTxt(asExport(doc)), "text/plain")}>
                  {t.exportTxt}
                </Button>
                <Button type="button" variant="outline" className="h-9" onClick={() => download(`${name}.md`, toMd(asExport(doc)), "text/markdown")}>
                  {t.exportMd}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-9"
                  onClick={() => download(`${name}.json`, toSearchJson([asExport(doc)]), "application/json")}
                >
                  {t.exportJson}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-9 text-destructive"
                  onClick={() => {
                    if (pending === doc.id) onDelete(doc.id);
                    else setPending(doc.id);
                  }}
                >
                  {pending === doc.id ? t.confirmDelete : t.delete}
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
