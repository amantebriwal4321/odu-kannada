import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createCanvas, GlobalFonts } from "@napi-rs/canvas";

const root = process.cwd();
const fontDir = path.join(root, "scripts/.cache");
const regularPath = path.join(fontDir, "NotoSansKannada-Regular.ttf");
const boldPath = path.join(fontDir, "NotoSansKannada-Bold.ttf");

const fontUrls = {
  regular: [
    "https://github.com/notofonts/kannada/raw/main/fonts/NotoSansKannada/full/ttf/NotoSansKannada-Regular.ttf",
    "https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSansKannada/NotoSansKannada-Regular.ttf",
  ],
  bold: [
    "https://github.com/notofonts/kannada/raw/main/fonts/NotoSansKannada/full/ttf/NotoSansKannada-Bold.ttf",
    "https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSansKannada/NotoSansKannada-Bold.ttf",
  ],
};

async function ensureFont(file, urls) {
  try {
    const existing = await readFile(file);
    if (existing.byteLength > 10_000) return;
  } catch {
    /* download */
  }
  await mkdir(fontDir, { recursive: true });
  let last = "no font url worked";
  for (const url of urls) {
    const response = await fetch(url);
    if (!response.ok) {
      last = `${url} ${response.status}`;
      continue;
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.byteLength < 10_000) {
      last = `${url} too small`;
      continue;
    }
    await writeFile(file, bytes);
    return;
  }
  throw new Error(last);
}

function wrap(ctx, text, maxWidth) {
  const lines = [];
  for (const paragraph of text.split("\n")) {
    if (!paragraph.trim()) {
      lines.push({ text: "", kind: "gap" });
      continue;
    }
    const words = paragraph.split(/\s+/);
    let line = "";
    const push = (value) => lines.push({ text: value, kind: paragraph === text.split("\n")[0] ? "banner" : "body", source: paragraph });
    for (const word of words) {
      const trial = line ? `${line} ${word}` : word;
      if (ctx.measureText(trial).width > maxWidth && line) {
        push(line);
        line = word;
      } else {
        line = trial;
      }
    }
    if (line) push(line);
  }
  return lines;
}

function lineStyle(entry, index) {
  if (!entry.text) return { size: 16, weight: 400, color: "#241c14", gap: 18 };
  if (entry.text === "ಕಾಲ್ಪನಿಕ ಮಾದರಿ") return { size: 18, weight: 700, color: "#8f2d2d", gap: 34 };
  if (index < 4 && entry.text.length < 48 && !entry.text.includes(":")) {
    return { size: 30, weight: 700, color: "#1e3a32", gap: 44 };
  }
  return { size: 22, weight: 400, color: "#241c14", gap: 36 };
}

function draw(sample) {
  const width = 1000;
  const measure = createCanvas(width, 200);
  const mctx = measure.getContext("2d");
  mctx.font = "22px 'Noto Sans Kannada'";
  const wrapped = wrap(mctx, sample.text, width - 140);
  let y = 150;
  const planned = wrapped.map((entry, index) => {
    const style = lineStyle(entry, index);
    const row = { ...entry, ...style, y };
    y += style.gap;
    return row;
  });
  const height = Math.max(720, y + 90);
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#f7f1e4";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "#e4d5be";
  ctx.lineWidth = 2;
  ctx.strokeRect(28, 28, width - 56, height - 56);
  ctx.fillStyle = "#1e3a32";
  ctx.fillRect(56, 52, 28, 28);
  ctx.fillStyle = "#f7f1e4";
  ctx.fillRect(64, 64, 12, 4);
  ctx.font = "700 22px 'Noto Sans Kannada'";
  ctx.fillStyle = "#1e3a32";
  ctx.fillText("ಓದು", 96, 74);
  ctx.strokeStyle = "#c4b49a";
  ctx.beginPath();
  ctx.moveTo(56, 108);
  ctx.lineTo(width - 56, 108);
  ctx.stroke();

  ctx.save();
  ctx.translate(width - 150, 78);
  ctx.rotate(-0.15);
  ctx.strokeStyle = "#9f2d2d";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, 0, 78, 32, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.font = "700 16px 'Noto Sans Kannada'";
  ctx.fillStyle = "#9f2d2d";
  ctx.textAlign = "center";
  ctx.fillText("ಕಾಲ್ಪನಿಕ", 0, 6);
  ctx.restore();

  for (const row of planned) {
    if (!row.text) continue;
    ctx.font = `${row.weight} ${row.size}px 'Noto Sans Kannada'`;
    ctx.fillStyle = row.color;
    ctx.textAlign = "left";
    ctx.fillText(row.text, 64, row.y);
  }
  return canvas.toBuffer("image/png");
}

await ensureFont(regularPath, fontUrls.regular);
await ensureFont(boldPath, fontUrls.bold);
GlobalFonts.registerFromPath(regularPath, "Noto Sans Kannada");
GlobalFonts.registerFromPath(boldPath, "Noto Sans Kannada");

const dataPath = path.join(root, "data/samples.json");
const data = JSON.parse(await readFile(dataPath, "utf8"));
await mkdir(path.join(root, "public/samples"), { recursive: true });

for (const sample of data.samples) {
  const png = draw(sample);
  const filename = path.basename(sample.file);
  await writeFile(path.join(root, "public/samples", filename), png);
  sample.sha256 = createHash("sha256").update(png).digest("hex");
  console.log(sample.id, sample.sha256.slice(0, 12), png.length);
}

await writeFile(dataPath, `${JSON.stringify(data, null, 2)}\n`);
