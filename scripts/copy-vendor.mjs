import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const tesseractDir = path.join(root, "public/vendor/tesseract");
const tessdataDir = path.join(root, "public/vendor/tessdata");

await mkdir(tesseractDir, { recursive: true });
await mkdir(tessdataDir, { recursive: true });

const files = [
  [
    "node_modules/tesseract.js/dist/worker.min.js",
    "public/vendor/tesseract/worker.min.js",
  ],
  [
    "node_modules/tesseract.js-core/tesseract-core-simd-lstm.wasm.js",
    "public/vendor/tesseract/tesseract-core-simd-lstm.wasm.js",
  ],
  [
    "node_modules/tesseract.js-core/tesseract-core-lstm.wasm.js",
    "public/vendor/tesseract/tesseract-core-lstm.wasm.js",
  ],
  [
    "node_modules/@tesseract.js-data/kan/4.0.0_best_int/kan.traineddata.gz",
    "public/vendor/tessdata/kan.traineddata.gz",
  ],
  ["node_modules/pdfjs-dist/build/pdf.worker.min.mjs", "public/vendor/pdf.worker.min.mjs"],
];

for (const [from, to] of files) {
  await copyFile(path.join(root, from), path.join(root, to));
}

console.log("copied OCR vendor files");
