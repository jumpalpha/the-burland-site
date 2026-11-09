"use client";
import Link from "next/link";
import { useEffect } from "react";
import { ATTRACTIONS } from "@/lib/content";
import { copyText, useStored } from "@/lib/useStored";

const EXTRAS = [
  { slug: "free-time", name: "Free time at The Burland", drive: "Right here" },
  { slug: "big-dinner", name: "Big family dinner in the ballroom", drive: "Right here" },
  { slug: "game-night", name: "Game night and the arcade", drive: "Right here" },
  { slug: "photo", name: "Family group photo", drive: "Right here" },
];
const ALL = [...ATTRACTIONS.map((a) => ({ slug: a.slug, name: a.name, drive: a.drive })), ...EXTRAS];
const nameOf = (slug: string) => ALL.find((x) => x.slug === slug);

interface S { days: { label: string; items: string[] }[] }
const init: S = { days: [{ label: "Day 1", items: [] }, { label: "Day 2", items: [] }, { label: "Day 3", items: [] }] };

export function Itinerary() {
  const [s, setS, ready] = useStored<S>("burland-itinerary", init);
  useEffect(() => {
    if (!ready) return;
    const add = new URLSearchParams(location.search).get("add");
    if (add && nameOf(add)) {
      setS((x) => (x.days.some((d) => d.items.includes(add)) ? x : { days: x.days.map((d, i) => (i === 0 ? { ...d, items: [...d.items, add] } : d)) }));
      history.replaceState(null, "", location.pathname);
    }
  }, [ready, setS]);

  const addTo = (day: number, slug: string) => setS({ days: s.days.map((d, i) => (i === day ? { ...d, items: [...d.items, slug] } : d)) });
  const remove = (day: number, idx: number) => setS({ days: s.days.map((d, i) => (i === day ? { ...d, items: d.items.filter((_, j) => j !== idx) } : d)) });
  const shift = (day: number, idx: number, dir: -1 | 1) =>
    setS({ days: s.days.map((d, i) => { if (i !== day) return d; const it = [...d.items]; const j = idx + dir; if (j < 0 || j >= it.length) return d; [it[idx], it[j]] = [it[j], it[idx]]; return { ...d, items: it }; }) });
  const text = s.days.map((d) => `${d.label}\n${d.items.map((x) => `- ${nameOf(x)?.name} (${nameOf(x)?.drive})`).join("\n") || "- open"}`).join("\n\n");

  return (
    <div className="grid" style={{ gap: 22 }}>
      <div className="grid g3">
        {s.days.map((d, di) => (
          <div key={di} className="panel">
            <input className="input" aria-label="Day name" value={d.label} onChange={(e) => setS({ days: s.days.map((x, i) => (i === di ? { ...x, label: e.target.value } : x)) })} style={{ fontFamily: "var(--display)", fontSize: "1.2rem", marginBottom: 12 }} />
            <ol style={{ listStyle: "none", padding: 0, margin: "0 0 12px", display: "grid", gap: 8 }}>
              {d.items.map((slug, ii) => {
                const a = nameOf(slug);
                return (
                  <li key={slug + ii} className="notice" style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                    <span><strong>{a?.name}</strong><br /><span className="small muted">{a?.drive}</span></span>
                    <span className="no-print" style={{ whiteSpace: "nowrap" }}>
                      <button type="button" className="x-btn" style={{ color: "var(--ink-2)" }} aria-label="Move up" onClick={() => shift(di, ii, -1)}>&uarr;</button>
                      <button type="button" className="x-btn" style={{ color: "var(--ink-2)" }} aria-label="Move down" onClick={() => shift(di, ii, 1)}>&darr;</button>
                      <button type="button" className="x-btn" aria-label={`Remove ${a?.name}`} onClick={() => remove(di, ii)}>&times;</button>
                    </span>
                  </li>
                );
              })}
            </ol>
            <select className="input no-print" aria-label={`Add to ${d.label}`} value="" onChange={(e) => e.target.value && addTo(di, e.target.value)}>
              <option value="">+ Add an outing</option>
              {ALL.map((a) => <option key={a.slug} value={a.slug}>{a.name}</option>)}
            </select>
          </div>
        ))}
      </div>
      <div className="row no-print">
        <button type="button" className="btn btn-line btn-sm" onClick={() => setS({ days: [...s.days, { label: `Day ${s.days.length + 1}`, items: [] }] })}>Add a day</button>
        {s.days.length > 1 && <button type="button" className="btn btn-line btn-sm" onClick={() => setS({ days: s.days.slice(0, -1) })}>Remove last day</button>}
        <button type="button" className="btn btn-dark btn-sm" onClick={() => copyText(text)}>Copy itinerary</button>
        <button type="button" className="btn btn-line btn-sm" onClick={() => window.print()}>Print</button>
      </div>
      <p className="small muted">Saved on this device only. Read more about each place in our <Link href="/area-attractions">local guide</Link>.</p>
    </div>
  );
}
