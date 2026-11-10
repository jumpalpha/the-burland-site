// Next static export writes route data as  route/__next.a/b/__PAGE__.txt
// but the client router requests            route/__next.a.b.__PAGE__.txt
// Copy each nested file to the flat name so client-side navigation and prefetch work on GitHub Pages.
import { readdir, copyFile, stat } from "node:fs/promises";
import path from "node:path";

let made = 0;
async function files(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await files(p)));
    else out.push(p);
  }
  return out;
}
async function walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const p = path.join(dir, e.name);
    if (e.name.startsWith("__next.")) {
      for (const f of await files(p)) {
        const rel = path.relative(dir, f).split(path.sep).join(".");
        const dest = path.join(dir, rel);
        try { await stat(dest); } catch { await copyFile(f, dest); made++; }
      }
    } else if (e.name !== "_next") {
      await walk(p);
    }
  }
}
await walk("out");
console.log(`rsc: ${made} flat route files`);
