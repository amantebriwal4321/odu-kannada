"use client";

function simdSupported(): boolean {
  try {
    return WebAssembly.validate(
      new Uint8Array([
        0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15,
        253, 98, 11,
      ]),
    );
  } catch {
    return false;
  }
}

export async function recognizeKannada(
  blob: Blob,
  onProgress?: (progress: number) => void,
): Promise<string> {
  const { createWorker } = await import("tesseract.js");
  const origin = window.location.origin;
  const core = simdSupported()
    ? "/vendor/tesseract/tesseract-core-simd-lstm.wasm.js"
    : "/vendor/tesseract/tesseract-core-lstm.wasm.js";
  const worker = await createWorker("kan", 1, {
    workerPath: `${origin}/vendor/tesseract/worker.min.js`,
    corePath: `${origin}${core}`,
    langPath: `${origin}/vendor/tessdata`,
    gzip: true,
    workerBlobURL: false,
    logger: (message) => {
      if (message.status === "recognizing text" && onProgress) onProgress(message.progress);
    },
  });
  try {
    const result = await worker.recognize(blob);
    return (result.data.text || "").replace(/\n{3,}/g, "\n\n").trim();
  } finally {
    await worker.terminate();
  }
}
