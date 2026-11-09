"use client";
import { useEffect, useMemo, useState } from "react";
import { addDays, diffDays, fmtDate, icsFile, isISO, todayLocal } from "@/lib/dates";
import { quote, quoteText, type DecorKey, type LineItem } from "@/lib/pricing";
import { copyText, useStored } from "@/lib/useStored";
import { ADDONS, POLICY, SITE, asset, fmtUSD } from "@/lib/site";
import { EstimateCard } from "@/components/booking/EstimateCard";

type Tab = "quote" | "replies" | "payments" | "checklists" | "links";
const TABS: [Tab, string][] = [["quote", "Quote builder"], ["replies", "Reply templates"], ["payments", "Payment tracker"], ["checklists", "Checklists"], ["links", "Quick links"]];

interface QuoteState { guest: string; email: string; mode: "overnight" | "hourly"; start: string; end: string; hours: number; decor: DecorKey; cloths: number; alcohol: boolean; adj: LineItem[] }
const initQuote: QuoteState = { guest: "", email: "", mode: "overnight", start: "", end: "", hours: 4, decor: "none", cloths: 0, alcohol: false, adj: [] };

function download(name: string, text: string, type = "text/calendar") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  Object.assign(document.createElement("a"), { href: url, download: name }).click();
  URL.revokeObjectURL(url);
}

function CopyBtn({ text, label = "Copy" }: { text: string; label?: string }) {
  const [ok, setOk] = useState(false);
  return <button type="button" className="btn btn-dark btn-sm" onClick={async () => { setOk(await copyText(text)); setTimeout(() => setOk(false), 1600); }}>{ok ? "Copied" : label}</button>;
}

export function OwnerTools() {
  const [tab, setTab] = useState<Tab>("quote");
  const [today, setToday] = useState("");
  const [qs, setQs] = useStored<QuoteState>("burland-owner-quote", initQuote);
  useEffect(() => setToday(todayLocal()), []);

  const q = useMemo(() => {
    if (!today || !isISO(qs.start)) return null;
    if (qs.mode === "overnight" && !isISO(qs.end)) return null;
    return quote({ mode: qs.mode, start: qs.start, end: qs.end, hours: qs.hours, decor: qs.decor, whiteTablecloths: qs.cloths, alcohol: qs.alcohol, adjustments: qs.adj }, today);
  }, [qs, today]);

  return (
    <div>
      <div className="tabs no-print" role="tablist">
        {TABS.map(([k, l]) => <button key={k} role="tab" type="button" aria-selected={tab === k} onClick={() => setTab(k)}>{l}</button>)}
      </div>
      {tab === "quote" && <QuoteBuilder qs={qs} setQs={setQs} q={q} />}
      {tab === "replies" && <Replies qs={qs} q={q} />}
      {tab === "payments" && <Payments today={today} />}
      {tab === "checklists" && <Checklists />}
      {tab === "links" && <Links />}
    </div>
  );
}

function QuoteBuilder({ qs, setQs, q }: { qs: QuoteState; setQs: (v: QuoteState) => void; q: ReturnType<typeof quote> | null }) {
  const set = <K extends keyof QuoteState>(k: K, v: QuoteState[K]) => setQs({ ...qs, [k]: v });
  const text = q ? `Hi ${qs.guest.split(" ")[0] || "there"},\n\nThank you for thinking of The Burland! Here is your quote:\n\n${quoteText(q, { start: qs.start, end: qs.mode === "overnight" ? qs.end : undefined })}\n\nTo hold the date, just reply to this email and I'll send the rental details form and agreement.\n\nThe Burland\n${SITE.phone}` : "";
  return (
    <div className="planner">
      <div className="panel form">
        <div className="two">
          <label className="field"><span>Guest name</span><input value={qs.guest} onChange={(e) => set("guest", e.target.value)} /></label>
          <label className="field"><span>Guest email</span><input type="email" value={qs.email} onChange={(e) => set("email", e.target.value)} /></label>
        </div>
        <div className="choice">
          <label><input type="radio" checked={qs.mode === "overnight"} onChange={() => set("mode", "overnight")} /><span>Overnight</span></label>
          <label><input type="radio" checked={qs.mode === "hourly"} onChange={() => set("mode", "hourly")} /><span>Hourly</span></label>
        </div>
        <div className="two">
          <label className="field"><span>{qs.mode === "overnight" ? "Arrival" : "Date"}</span><input type="date" value={qs.start} onChange={(e) => setQs({ ...qs, start: e.target.value, end: qs.end && qs.end > e.target.value ? qs.end : addDays(e.target.value, 2) })} /></label>
          {qs.mode === "overnight"
            ? <label className="field"><span>Check-out</span><input type="date" value={qs.end} min={qs.start} onChange={(e) => set("end", e.target.value)} /></label>
            : <label className="field"><span>Hours</span><input type="number" min={1} max={12} value={qs.hours} onChange={(e) => set("hours", Number(e.target.value) || 1)} /></label>}
        </div>
        <div className="two">
          <label className="field"><span>Decor</span><select value={qs.decor} onChange={(e) => set("decor", e.target.value as DecorKey)}>{(Object.keys(ADDONS.decor) as DecorKey[]).map((k) => <option key={k} value={k}>{ADDONS.decor[k].label}</option>)}</select></label>
          <label className="field"><span>White tablecloths</span><input type="number" min={0} value={qs.cloths} onChange={(e) => set("cloths", Number(e.target.value) || 0)} /></label>
        </div>
        <label className="tick"><input type="checkbox" checked={qs.alcohol} onChange={(e) => set("alcohol", e.target.checked)} />Alcohol served ({fmtUSD(ADDONS.alcohol)} fee)</label>
        <div className="field">
          <span className="legend">Adjustments (discounts as negative numbers)</span>
          {qs.adj.map((a, i) => (
            <div key={i} className="three" style={{ gridTemplateColumns: "2fr 1fr auto" }}>
              <input className="input" aria-label="Adjustment label" value={a.label} onChange={(e) => set("adj", qs.adj.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
              <input className="input" aria-label="Amount" type="number" value={a.amount} onChange={(e) => set("adj", qs.adj.map((x, j) => (j === i ? { ...x, amount: Number(e.target.value) || 0 } : x)))} />
              <button type="button" className="x-btn" aria-label="Remove adjustment" onClick={() => set("adj", qs.adj.filter((_, j) => j !== i))}>&times;</button>
            </div>
          ))}
          <div className="row">
            <button type="button" className="btn btn-line btn-sm" onClick={() => set("adj", [...qs.adj, { label: "Returning family discount", amount: -100 }])}>Add adjustment</button>
            <button type="button" className="btn btn-line btn-sm" onClick={() => setQs(initQuote)}>Clear</button>
          </div>
        </div>
        {q && (
          <>
            <div className="copy-box">{text}</div>
            <div className="row">
              <CopyBtn text={text} label="Copy quote email" />
              {qs.email && <a className="btn btn-line btn-sm" href={`mailto:${encodeURIComponent(qs.email)}?subject=${encodeURIComponent("Your Burland quote")}&body=${encodeURIComponent(text)}`}>Open in email</a>}
              <button type="button" className="btn btn-line btn-sm" onClick={() => window.print()}>Print quote</button>
            </div>
          </>
        )}
      </div>
      <EstimateCard q={q} start={qs.start || null} end={qs.mode === "overnight" ? qs.end || null : qs.start || null} title={qs.guest ? `Quote for ${qs.guest}` : "Quote"} />
    </div>
  );
}

function Replies({ qs, q }: { qs: QuoteState; q: ReturnType<typeof quote> | null }) {
  const [name, setName] = useState(qs.guest.split(" ")[0] || "");
  const [ref, setRef] = useState("");
  const dates = qs.start ? `${fmtDate(qs.start)}${qs.mode === "overnight" && qs.end ? " to " + fmtDate(qs.end) : ""}` : "[dates]";
  const hi = `Hi ${name || "[name]"},`;
  const sig = `\n\nThe Burland\n${SITE.phone}\n${SITE.url.replace("https://", "")}`;
  const templates: [string, string][] = [
    ["First reply to an inquiry", `${hi}\n\nThank you so much for reaching out about The Burland! ${dates} is open right now. I'd love to hold it for you.\n\n${q ? `Your estimate is ${fmtUSD(q.total)}, with ${fmtUSD(q.dueAtBooking)} due at booking${q.balanceDue ? ` and the balance due by ${fmtDate(q.balanceDue)}` : ""}. ` : ""}There's also a ${fmtUSD(POLICY.securityDeposit)} refundable security deposit.\n\nNext I'll send a short rental details form, then your agreement through SignNow. Your date is reserved once it's signed and the first payment is in.\n\nWould you like to come see the building first? I'm happy to set up a tour.${sig}`],
    ["Date is not available", `${hi}\n\nThank you for thinking of The Burland. Unfortunately ${dates} is already reserved. A few nearby dates are still open, and you can see them all at ${SITE.url}/availability.\n\nIf you're flexible, let me know and I'll help you find the best fit.${sig}`],
    ["Tour confirmation", `${hi}\n\nYou're all set for a tour of The Burland on [day and time]. We're in downtown St. Anthony. Text me at ${SITE.phone} when you're out front and I'll meet you at the door.\n\nLooking forward to showing you around!${sig}`],
    ["Rental details form link", `${hi}\n\nHere's the link to send your rental details. I've already filled in what you sent me, so it only takes a minute:\n\n${SITE.url}/rental/${ref ? `#r=${ref}` : ""}\n\nOnce you submit it, I'll send your agreement through SignNow. Please check your spam folder if you don't see it.${sig}`],
    ["Balance reminder", `${hi}\n\nJust a friendly reminder that the remaining balance${q ? ` of ${fmtUSD(q.balance)}` : ""} for your stay on ${dates} is due${q?.balanceDue ? ` by ${fmtDate(q.balanceDue)}` : " 90 days before arrival"}. Let me know if you have any questions.\n\nWe can't wait to have you!${sig}`],
    ["Pre-arrival info (1 week out)", `${hi}\n\nYour stay at The Burland is almost here! A few quick notes:\n\n- Check-in begins at 3:00 p.m. on ${qs.start ? fmtDate(qs.start, { weekday: true }) : "[arrival]"}, and check-out is 11:00 a.m.${qs.mode === "overnight" && qs.end ? ` on ${fmtDate(qs.end, { weekday: true })}` : ""}.\n- The full kitchen is yours, so bring groceries for your planned meals.\n- Bring pillows and towels if your group planned to.\n- Need ideas? Our local guide: ${SITE.url}/area-attractions\n\nText me at ${SITE.phone} with any questions, or when you arrive.${sig}`],
    ["Thank you, deposit, and review", `${hi}\n\nThank you for staying at The Burland! It was a joy to have your family here.\n\nYour security deposit refund of ${fmtUSD(POLICY.securityDeposit - POLICY.cleaningFee)} is on its way (the ${fmtUSD(POLICY.cleaningFee)} cleaning fee is deducted).\n\nIf you have a minute, a Google review helps other families find us more than anything else. We'd be so grateful.\n\nCome back soon!${sig}`],
  ];
  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="two panel">
        <label className="field"><span>Guest first name</span><input value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label className="field"><span>Rental form code (from the inquiry email), optional</span><input value={ref} onChange={(e) => setRef(e.target.value.replace(/[^A-Za-z0-9]/g, ""))} /></label>
      </div>
      <p className="small muted">Dates and amounts come from the Quote builder tab.</p>
      {templates.map(([t, body]) => (
        <details key={t} className="panel">
          <summary style={{ cursor: "pointer", fontFamily: "var(--display)", fontSize: "1.15rem" }}>{t}</summary>
          <div className="copy-box" style={{ marginTop: 14 }}>{body}</div>
          <div className="row" style={{ marginTop: 10 }}><CopyBtn text={body} /></div>
        </details>
      ))}
    </div>
  );
}

interface Booking { id: string; guest: string; start: string; end: string; total: number; paid: number; deposit: boolean }

function Payments({ today }: { today: string }) {
  const [list, setList] = useStored<Booking[]>("burland-owner-bookings", []);
  const [f, setF] = useState({ guest: "", start: "", end: "", total: "", paid: "" });
  const rows = [...list].sort((a, b) => a.start.localeCompare(b.start));
  const status = (b: Booking) => {
    const due = addDays(b.start, -POLICY.balanceDaysBefore);
    const owed = b.total - b.paid;
    if (b.start < today) return { due, owed, label: b.deposit ? "Stay done. Refund deposit" : "Stay done", tone: "" };
    if (owed <= 0) return { due, owed, label: "Paid in full", tone: "ok" };
    if (due < today) return { due, owed, label: "Balance overdue", tone: "err" };
    if (diffDays(today, due) <= 14) return { due, owed, label: `Balance due in ${diffDays(today, due)} days`, tone: "warn" };
    return { due, owed, label: "On track", tone: "" };
  };
  function add() {
    if (!f.guest || !isISO(f.start)) return;
    setList([...list, { id: Math.random().toString(36).slice(2), guest: f.guest, start: f.start, end: isISO(f.end) ? f.end : f.start, total: Number(f.total) || 0, paid: Number(f.paid) || 0, deposit: true }]);
    setF({ guest: "", start: "", end: "", total: "", paid: "" });
  }
  const upd = (id: string, patch: Partial<Booking>) => setList(list.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  function reminders() {
    const ev = rows.filter((b) => b.total - b.paid > 0 && addDays(b.start, -POLICY.balanceDaysBefore) >= today);
    const cal = ev.map((b) => icsFile({ title: `Burland balance due: ${b.guest} (${fmtUSD(b.total - b.paid)})`, start: addDays(b.start, -POLICY.balanceDaysBefore), endExclusive: addDays(b.start, -POLICY.balanceDaysBefore + 1), description: `Arrival ${b.start}. Send the balance reminder template.` }));
    const body = cal.map((c) => c.split("\r\n").slice(3, -1).join("\r\n")).join("\r\n");
    download("burland-balance-reminders.ics", ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//The Burland//owner//EN", body, "END:VCALENDAR"].join("\r\n"));
  }
  return (
    <div className="grid" style={{ gap: 18 }}>
      <p className="notice small">Saved only in this browser on this device. It is not shared or backed up, so the Burland sheet stays the official record.</p>
      <div className="panel">
        <div className="grid g4" style={{ gap: 12 }}>
          <label className="field"><span>Guest</span><input value={f.guest} onChange={(e) => setF({ ...f, guest: e.target.value })} /></label>
          <label className="field"><span>Arrival</span><input type="date" value={f.start} onChange={(e) => setF({ ...f, start: e.target.value })} /></label>
          <label className="field"><span>Total</span><input inputMode="decimal" value={f.total} onChange={(e) => setF({ ...f, total: e.target.value })} /></label>
          <label className="field"><span>Paid so far</span><input inputMode="decimal" value={f.paid} onChange={(e) => setF({ ...f, paid: e.target.value })} /></label>
        </div>
        <div className="row" style={{ marginTop: 12 }}>
          <button type="button" className="btn btn-dark btn-sm" onClick={add}>Add booking</button>
          {rows.length > 0 && <button type="button" className="btn btn-line btn-sm" onClick={reminders}>Download balance reminders for my calendar</button>}
        </div>
      </div>
      {rows.length > 0 && (
        <div className="table-wrap">
          <table className="mini-table">
            <thead><tr><th>Guest</th><th>Arrival</th><th>Total</th><th>Paid</th><th>Balance due</th><th>Status</th><th>Deposit back</th><th></th></tr></thead>
            <tbody>
              {rows.map((b) => {
                const s = status(b);
                return (
                  <tr key={b.id}>
                    <td>{b.guest}</td>
                    <td>{fmtDate(b.start)}</td>
                    <td>{fmtUSD(b.total)}</td>
                    <td><input className="input" aria-label="Paid" inputMode="decimal" value={b.paid} onChange={(e) => upd(b.id, { paid: Number(e.target.value) || 0 })} style={{ width: 100 }} /></td>
                    <td>{fmtUSD(Math.max(0, s.owed))} by {fmtDate(s.due)}</td>
                    <td><span className={"notice small " + s.tone} style={{ padding: "4px 10px" }}>{s.label}</span></td>
                    <td><label className="tick"><input type="checkbox" checked={!b.deposit} onChange={(e) => upd(b.id, { deposit: !e.target.checked })} />Sent</label></td>
                    <td><button type="button" className="x-btn" aria-label={`Remove ${b.guest}`} onClick={() => setList(list.filter((x) => x.id !== b.id))}>&times;</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const CHECKLISTS: Record<string, string[]> = {
  "When an inquiry comes in": ["Check the Google Calendar for the dates", "Reply within one business day (use the First reply template)", "Send the rental details link with the guest's code", "Make the agreement and send it through SignNow", "After signing and payment, add the dates to the calendar as Reserved", "Add the booking to the Payment tracker"],
  "One week before arrival": ["Send the Pre-arrival template", "Confirm the guest count and arrival time", "Confirm decor package and setup time, if any", "Check heating, cooling, and Wi-Fi", "Stock paper goods, soap, and trash bags"],
  "Turnover and cleaning": ["Strip and wash bedding in every suite", "Clean bathrooms and restock supplies", "Kitchen: dishes, counters, fridge cleared out, floors", "Ballroom and game room reset, tables and chairs stacked", "Trash and recycling out", "Walk every room for damage or left-behind items", "Take photos of any damage for the deposit record", "Lock up and set the thermostat"],
  "After the stay": ["Refund the deposit (minus the $250 cleaning fee and any damage)", "Send the Thank you template with the review request", "Mark the stay done in the Payment tracker", "Add the family to the newsletter list if they opted in"],
};

function Checklists() {
  const [done, setDone] = useStored<string[]>("burland-owner-checks", []);
  return (
    <div className="grid g2">
      {Object.entries(CHECKLISTS).map(([h, items]) => (
        <div key={h} className="panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <h3 style={{ margin: 0 }}>{h}</h3>
            <button type="button" className="btn btn-line btn-sm no-print" onClick={() => setDone(done.filter((k) => !k.startsWith(h + ":")))}>Reset</button>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: "14px 0 0", display: "grid", gap: 8 }}>
            {items.map((i) => {
              const k = h + ":" + i;
              return <li key={k}><label className="tick"><input type="checkbox" checked={done.includes(k)} onChange={() => setDone(done.includes(k) ? done.filter((x) => x !== k) : [...done, k])} />{i}</label></li>;
            })}
          </ul>
        </div>
      ))}
      <div className="row no-print"><button type="button" className="btn btn-dark btn-sm" onClick={() => window.print()}>Print checklists</button></div>
    </div>
  );
}

function Links() {
  const [mine, setMine] = useStored<{ label: string; url: string }[]>("burland-owner-links", []);
  const [f, setF] = useState({ label: "", url: "" });
  const fixed = [
    { label: "Google Calendar", url: "https://calendar.google.com/" },
    { label: "SignNow", url: "https://app.signnow.com/" },
    { label: "Rental review page", url: asset("/rental-review.html") },
    { label: "Gmail", url: "https://mail.google.com/" },
    { label: "Public availability page", url: asset("/availability/") },
  ];
  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="grid g3">
        {[...fixed, ...mine].map((l, i) => (
          <div key={l.label + i} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <a href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a>
            {i >= fixed.length && <button type="button" className="x-btn" aria-label={`Remove ${l.label}`} onClick={() => setMine(mine.filter((_, j) => j !== i - fixed.length))}>&times;</button>}
          </div>
        ))}
      </div>
      <div className="panel">
        <p className="small muted" style={{ marginTop: 0 }}>Add your own links (the Burland sheet, bank, cleaning crew). They&apos;re saved only in this browser, never on the website.</p>
        <div className="three" style={{ gridTemplateColumns: "1fr 2fr auto" }}>
          <input className="input" placeholder="Label" value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} />
          <input className="input" placeholder="https://..." value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} />
          <button type="button" className="btn btn-dark btn-sm" onClick={() => { if (f.label && /^https?:\/\//.test(f.url)) { setMine([...mine, f]); setF({ label: "", url: "" }); } }}>Add</button>
        </div>
      </div>
    </div>
  );
}
