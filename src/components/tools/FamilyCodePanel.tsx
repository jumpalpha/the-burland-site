"use client";
import Link from "next/link";
import { useState } from "react";
import { formatCode } from "@/lib/familyCode";
import { copyText } from "@/lib/useStored";
import type { FamilyState } from "@/lib/useFamilyPlan";

const TOOLS = [
  { href: "/plan/meals", label: "Meals" },
  { href: "/plan/packing", label: "What to bring" },
  { href: "/plan/itinerary", label: "Itinerary" },
];

export function FamilyCodePanel({ family, current }: { family: FamilyState; current: string }) {
  const [input, setInput] = useState("");
  const { code, status, msg, busy } = family;
  const others = TOOLS.filter((t) => t.href !== current);
  const copy = async (text: string, label: string) => { if (await copyText(text)) family.setMsg(`${label} copied.`); };

  return (
    <div className="panel no-print" style={{ display: "grid", gap: 12 }}>
      {code ? (
        <>
          <div className="row" style={{ alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span>Family code</span>
            <strong style={{ fontSize: "1.6rem", letterSpacing: "0.12em", fontFamily: "monospace" }}>{formatCode(code)}</strong>
            <span className="small muted" role="status">
              {status === "saving" ? "Saving..." : status === "offline" ? "Offline. Changes sync when you're back online." : "Synced with your family"}
            </span>
          </div>
          <div className="row" style={{ flexWrap: "wrap" }}>
            <button type="button" className="btn btn-dark btn-sm" onClick={() => copy(`${window.location.origin}${window.location.pathname}?family=${formatCode(code)}`, "Share link")}>Copy share link</button>
            <button type="button" className="btn btn-line btn-sm" onClick={() => copy(formatCode(code), "Code")}>Copy code</button>
            <button type="button" className="btn btn-line btn-sm" onClick={family.leave}>Stop syncing on this device</button>
          </div>
          <p className="small muted" style={{ margin: 0 }}>
            Same code for every planner: {others.map((t, i) => <span key={t.href}>{i > 0 && " and "}<Link href={t.href}>{t.label.toLowerCase()}</Link></span>)}. Anyone with the code can view and edit, so share it only with your family.
          </p>
        </>
      ) : (
        <>
          <strong>Plan together with a family code</strong>
          <p className="small muted" style={{ margin: 0 }}>Create one code for your family and share it. Every household can review and add to the meals, what to bring, and itinerary from their own phone.</p>
          <div className="row" style={{ flexWrap: "wrap" }}>
            <button type="button" className="btn btn-dark btn-sm" disabled={busy} onClick={family.create}>Create family code</button>
            <form className="row" style={{ gap: 8 }} onSubmit={(e) => { e.preventDefault(); family.join(input); setInput(""); }}>
              <input className="input" aria-label="Family code" placeholder="Have a code? K7QM-R2XD" value={input} onChange={(e) => setInput(e.target.value)} style={{ width: 210, textTransform: "uppercase" }} />
              <button type="submit" className="btn btn-line btn-sm" disabled={busy || !input.trim()}>Join</button>
            </form>
          </div>
        </>
      )}
      {msg && <p className="small" role="status" style={{ margin: 0 }}>{msg}</p>}
    </div>
  );
}
