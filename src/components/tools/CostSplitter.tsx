"use client";
import Link from "next/link";
import { useEffect } from "react";
import { splitCost, type Household } from "@/lib/split";
import { copyText, useStored } from "@/lib/useStored";

interface S { total: string; mode: "family" | "head"; kidWeight: number; byNights: boolean; families: Household[] }
const init: S = {
  total: "",
  mode: "head",
  kidWeight: 0.5,
  byNights: true,
  families: [
    { name: "Family 1", adults: 2, kids: 2, nights: 2 },
    { name: "Family 2", adults: 2, kids: 0, nights: 2 },
  ],
};
const money = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function CostSplitter() {
  const [s, setS] = useStored<S>("burland-split", init);
  useEffect(() => {
    try {
      const t = sessionStorage.getItem("burland-total");
      if (t) { setS((x) => ({ ...x, total: t })); sessionStorage.removeItem("burland-total"); }
    } catch {}
  }, [setS]);
  const total = Number(s.total) || 0;
  const res = splitCost(total, s.families, s);
  const upd = (i: number, k: keyof Household, v: string) =>
    setS((x) => ({ ...x, families: x.families.map((f, j) => (j === i ? { ...f, [k]: k === "name" ? v : Math.max(0, Number(v) || 0) } : f)) }));
  const text = [`Burland reunion cost split (total ${money(total)})`, ...res.map((r) => `${r.name}: ${money(r.amount)}`)].join("\n");

  return (
    <div className="grid" style={{ gap: 22 }}>
      <div className="panel form">
        <div className="two">
          <label className="field"><span>Total to split</span><input inputMode="decimal" value={s.total} placeholder="e.g. 4500" onChange={(e) => setS({ ...s, total: e.target.value.replace(/[^0-9.]/g, "") })} /></label>
          <div className="field">
            <span className="legend">Split by</span>
            <div className="choice">
              <label><input type="radio" checked={s.mode === "head"} onChange={() => setS({ ...s, mode: "head" })} /><span>Per person</span></label>
              <label><input type="radio" checked={s.mode === "family"} onChange={() => setS({ ...s, mode: "family" })} /><span>Per family</span></label>
            </div>
          </div>
        </div>
        {s.mode === "head" && (
          <div className="field">
            <span className="legend">Kids pay</span>
            <div className="choice">
              {[[0, "Free"], [0.5, "Half"], [1, "Full"]].map(([w, l]) => (
                <label key={l}><input type="radio" checked={s.kidWeight === w} onChange={() => setS({ ...s, kidWeight: w as number })} /><span>{l}</span></label>
              ))}
            </div>
          </div>
        )}
        <label className="tick"><input type="checkbox" checked={s.byNights} onChange={(e) => setS({ ...s, byNights: e.target.checked })} />Families staying fewer nights pay less</label>
      </div>
      <div className="table-wrap">
        <table className="mini-table">
          <thead><tr><th>Household</th><th>Adults</th><th>Kids</th>{s.byNights && <th>Nights</th>}<th>Owes</th><th><span className="sr-only">Remove</span></th></tr></thead>
          <tbody>
            {s.families.map((f, i) => (
              <tr key={i}>
                <td><input className="input" aria-label="Household name" value={f.name} onChange={(e) => upd(i, "name", e.target.value)} /></td>
                <td><input className="input" aria-label="Adults" type="number" min={0} value={f.adults} onChange={(e) => upd(i, "adults", e.target.value)} style={{ width: 72 }} /></td>
                <td><input className="input" aria-label="Kids" type="number" min={0} value={f.kids} onChange={(e) => upd(i, "kids", e.target.value)} style={{ width: 72 }} /></td>
                {s.byNights && <td><input className="input" aria-label="Nights" type="number" min={0} value={f.nights} onChange={(e) => upd(i, "nights", e.target.value)} style={{ width: 72 }} /></td>}
                <td className="amt">{money(res[i]?.amount ?? 0)}</td>
                <td><button type="button" className="x-btn" aria-label={`Remove ${f.name}`} onClick={() => setS({ ...s, families: s.families.filter((_, j) => j !== i) })}>&times;</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="row no-print">
        <button type="button" className="btn btn-line btn-sm" onClick={() => setS({ ...s, families: [...s.families, { name: `Family ${s.families.length + 1}`, adults: 2, kids: 0, nights: s.families[0]?.nights ?? 2 }] })}>Add a household</button>
        <button type="button" className="btn btn-dark btn-sm" onClick={() => copyText(text)}>Copy for the family group chat</button>
        <button type="button" className="btn btn-line btn-sm" onClick={() => window.print()}>Print</button>
        <button type="button" className="btn btn-line btn-sm" onClick={() => setS(init)}>Reset</button>
      </div>
      <p className="small muted">Saved on this device only. Need the total? Get an <Link href="/book">instant estimate</Link> first.</p>
    </div>
  );
}
