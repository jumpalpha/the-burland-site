"use client";
import { useCallback, useEffect, useState } from "react";
import { PHOTOS, type Photo } from "@/lib/content";
import { asset } from "@/lib/site";

const GROUPS = ["All", ...Array.from(new Set(PHOTOS.filter((p) => p.group !== "Area").map((p) => p.group)))];

export function Gallery() {
  const [group, setGroup] = useState("All");
  const [open, setOpen] = useState<number | null>(null);
  const list: Photo[] = PHOTOS.filter((p) => p.group !== "Area" && (group === "All" || p.group === group));
  const move = useCallback((n: number) => setOpen((i) => (i === null ? i : (i + n + list.length) % list.length)), [list.length]);

  useEffect(() => {
    if (open === null) return;
    const on = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") move(1);
      if (e.key === "ArrowLeft") move(-1);
    };
    document.addEventListener("keydown", on);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", on); document.body.style.overflow = ""; };
  }, [open, move]);

  const cur = open !== null ? list[open] : null;
  return (
    <>
      <div className="filters choice" role="radiogroup" aria-label="Filter photos">
        {GROUPS.map((g) => (
          <label key={g}><input type="radio" name="g" checked={group === g} onChange={() => setGroup(g)} /><span>{g}</span></label>
        ))}
      </div>
      <div className="masonry">
        {list.map((p, i) => (
          <button key={p.src} type="button" onClick={() => setOpen(i)} aria-label={`Open photo: ${p.alt}`}>
            <picture>
              <source type="image/webp" srcSet={`${asset("/opt/")}${p.src}-640.webp 640w, ${asset("/opt/")}${p.src}-1080.webp 1080w`} sizes="(max-width: 700px) 100vw, 33vw" />
              <img src={asset(`/${p.src}.jpg`)} alt={p.alt} width={p.w} height={p.h} loading="lazy" decoding="async" />
            </picture>
          </button>
        ))}
      </div>
      {cur && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={cur.alt} onClick={() => setOpen(null)}>
          <figure style={{ margin: 0 }} onClick={(e) => e.stopPropagation()}>
            <picture>
              <source type="image/webp" srcSet={asset(`/opt/${cur.src}-1600.webp`)} />
              <img src={asset(`/${cur.src}.jpg`)} alt={cur.alt} />
            </picture>
            <figcaption>{cur.alt} &middot; {(open ?? 0) + 1} of {list.length}</figcaption>
          </figure>
          <button className="lb-btn lb-close" onClick={() => setOpen(null)} aria-label="Close" autoFocus>&times;</button>
          <button className="lb-btn lb-prev" onClick={(e) => { e.stopPropagation(); move(-1); }} aria-label="Previous photo">&#8249;</button>
          <button className="lb-btn lb-next" onClick={(e) => { e.stopPropagation(); move(1); }} aria-label="Next photo">&#8250;</button>
        </div>
      )}
    </>
  );
}
