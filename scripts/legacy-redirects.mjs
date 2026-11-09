// Old site URLs were /page.html. Keep them working (including #r=CODE on rental links) by redirecting to /page/.
import { writeFile } from "node:fs/promises";

const PAGES = ["pricing", "availability", "contact", "weddings", "reunions", "gallery", "area-attractions", "guides", "guide-reunion", "guide-wedding", "rental"];
for (const p of PAGES) {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>The Burland</title><meta name="robots" content="noindex"><link rel="canonical" href="https://theburland.com/${p}/"><meta http-equiv="refresh" content="0; url=/${p}/"><script>location.replace("/${p}/"+location.search+location.hash)</script></head><body><a href="/${p}/">Continue</a></body></html>`;
  await writeFile(`out/${p}.html`, html);
}
console.log(`legacy redirects: ${PAGES.length}`);
