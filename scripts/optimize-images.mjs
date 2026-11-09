// Makes WebP copies of every public/img-*.jpg at 3 widths into public/opt/ (skips ones already made).
import sharp from "sharp";
import { readdir, mkdir, stat } from "node:fs/promises";
import path from "node:path";

const src = path.resolve("public"), out = path.join(src, "opt");
const WIDTHS = [640, 1080, 1600];
await mkdir(out, { recursive: true });
const files = (await readdir(src)).filter((f) => /^img-.*\.jpg$/.test(f));
let made = 0;
for (const f of files) {
  const base = f.replace(/\.jpg$/, "");
  for (const w of WIDTHS) {
    const dest = path.join(out, `${base}-${w}.webp`);
    try { await stat(dest); continue; } catch {}
    await sharp(path.join(src, f)).resize({ width: w, withoutEnlargement: true }).webp({ quality: 74 }).toFile(dest);
    made++;
  }
}
console.log(`images: ${files.length} sources, ${made} new webp files`);
