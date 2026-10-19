"use client";

import { useEffect, useState } from "react";

export function useObjectUrl(blob: Blob | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);
  const [source, setSource] = useState(blob);
  if (source !== blob) {
    setSource(blob);
    setUrl(null);
  }
  useEffect(() => {
    if (!blob) return;
    const next = URL.createObjectURL(blob);
    const timer = window.setTimeout(() => setUrl(next), 0);
    return () => {
      window.clearTimeout(timer);
      URL.revokeObjectURL(next);
    };
  }, [blob]);
  return url;
}
