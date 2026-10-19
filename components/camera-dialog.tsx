"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Copy } from "@/lib/i18n";

export function CameraDialog({
  open,
  onOpenChange,
  onCapture,
  t,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (blob: Blob) => void;
  t: Copy;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState(false);

  if (!open && error) setError(false);

  useEffect(() => {
    if (!open) return;
    let gone = false;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false })
      .then((stream) => {
        if (gone) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
      })
      .catch(() => {
        if (!gone) setError(true);
      });
    return () => {
      gone = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [open]);

  async function capture() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.drawImage(video, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
    if (!blob) return;
    onCapture(blob);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t.cameraTitle}</DialogTitle>
          <DialogDescription>{error ? t.cameraDenied : t.pdfNote}</DialogDescription>
        </DialogHeader>
        {error ? null : (
          <video ref={videoRef} className="aspect-[3/4] w-full rounded-lg bg-black object-cover sm:aspect-video" playsInline muted />
        )}
        <DialogFooter className="sm:justify-between">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t.close}
          </Button>
          <Button type="button" onClick={() => void capture()} disabled={error}>
            {t.capture}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
