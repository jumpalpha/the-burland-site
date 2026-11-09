"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { RangeCalendar } from "./RangeCalendar";
import { EstimateCard } from "./EstimateCard";
import { addDays, diffDays, fmtDate, icsFile, isISO, todayLocal, type ISODate } from "@/lib/dates";
import { hourlyAllowed, quote, quoteText, type DecorKey } from "@/lib/pricing";
import { loadAvailability, type Availability } from "@/lib/availability";
import { submitForm, validEmail } from "@/lib/forms";
import { ADDONS, EVENT_TYPES, FOUND_US, SITE, SPACES, fmtUSD } from "@/lib/site";

type Step = 0 | 1 | 2 | 3;
const STEPS = ["Dates", "Details", "Your info", "Sent"];
const DRAFT_KEY = "burland-booking-draft";

interface Details {
  eventType: string;
  overnight: string;
  maxGuests: string;
  spaces: string[];
  decor: DecorKey;
  tablecloths: string;
  alcohol: "" | "Yes" | "No";
  tour: boolean;
}
interface Contact { name: string; email: string; phone: string; street: string; city: string; state: string; zip: string; found: string; message: string; newsletter: boolean }

const emptyDetails: Details = { eventType: EVENT_TYPES[0], overnight: "", maxGuests: "", spaces: [], decor: "none", tablecloths: "", alcohol: "", tour: false };
const emptyContact: Contact = { name: "", email: "", phone: "", street: "", city: "", state: "ID", zip: "", found: "Google", message: "", newsletter: false };

export function BookingPlanner() {
  const t0 = useRef(Date.now());
  const [today, setToday] = useState<ISODate>("");
  const [step, setStep] = useState<Step>(0);
  const [mode, setMode] = useState<"overnight" | "hourly">("overnight");
  const [start, setStart] = useState<ISODate | null>(null);
  const [end, setEnd] = useState<ISODate | null>(null);
  const [hours, setHours] = useState(4);
  const [d, setD] = useState<Details>(emptyDetails);
  const [c, setC] = useState<Contact>(emptyContact);
  const [avail, setAvail] = useState<Availability>({ live: false, busy: new Set(), holidays: new Set() });
  const [status, setStatus] = useState<{ kind: "" | "sending" | "err"; msg: string }>({ kind: "", msg: "" });
  const [agree, setAgree] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = todayLocal();
    setToday(t);
    try {
      const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
      if (saved?.d) setD({ ...emptyDetails, ...saved.d });
      if (saved?.c) setC({ ...emptyContact, ...saved.c });
    } catch {}
    const p = new URLSearchParams(location.search);
    const s = p.get("start"), e = p.get("end"), type = p.get("type");
    if (type && (EVENT_TYPES as readonly string[]).includes(type)) setD((x) => ({ ...x, eventType: type }));
    if (isISO(s) && s >= t) { setStart(s); setEnd(isISO(e) && e > s ? e : null); }
    if (p.get("mode") === "hourly") setMode("hourly");
    loadAvailability(t, addDays(t, 730)).then(setAvail);
  }, []);

  useEffect(() => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ d, c })); } catch {}
  }, [d, c]);

  const q = useMemo(() => {
    if (!start || !today) return null;
    if (mode === "overnight" && !end) return null;
    return quote(
      {
        mode,
        start,
        end: end ?? undefined,
        hours,
        decor: d.decor,
        whiteTablecloths: Number(d.tablecloths) || 0,
        alcohol: d.alcohol === "Yes",
        extraHolidays: [...avail.holidays],
      },
      today,
    );
  }, [mode, start, end, hours, d.decor, d.tablecloths, d.alcohol, avail.holidays, today]);

  const go = (s: Step) => { setStep(s); topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const datesOk = !!q && q.problems.length === 0;
  const maxGuests = Number(d.maxGuests) || 0;
  const detailsOk = !!d.eventType && d.alcohol !== "" && maxGuests > 0 && maxGuests <= SITE.maxInBuilding;

  async function send() {
    if (!c.name.trim() || !validEmail(c.email)) return setStatus({ kind: "err", msg: "Please add your name and a valid email address." });
    if (!c.street.trim() || !c.city.trim() || !c.state.trim() || !c.zip.trim()) return setStatus({ kind: "err", msg: "Please add your mailing address. It goes on the rental agreement." });
    if (!agree) return setStatus({ kind: "err", msg: "Please check the box to confirm you understand nothing is booked until the agreement is signed." });
    if (!q || !start) return;
    setStatus({ kind: "sending", msg: "Sending your request..." });
    const nights = mode === "overnight" && end ? diffDays(start, end) : 0;
    const summary = quoteText(q, { start, end: end ?? undefined, name: c.name });
    const msg = [
      c.message.trim(),
      mode === "hourly" ? `Hourly request: ${hours} hours on ${start}.` : "",
      d.spaces.length ? `Spaces of interest: ${d.spaces.join(", ")}` : "",
      d.tour ? "They would like a site visit before booking." : "",
      "",
      "Website estimate:",
      summary,
    ].filter((x, i, a) => x !== "" || (i > 0 && a[i - 1] !== "")).join("\n");
    try {
      const r = await submitForm("inquiry", t0.current, {
        name: c.name.trim(),
        email: c.email.trim(),
        phone: c.phone.trim(),
        event_type: d.eventType,
        booking_date: start,
        nights,
        overnight_guests: d.overnight,
        max_guests: d.maxGuests,
        addons: ADDONS.decor[d.decor].formValue,
        alcohol: d.alcohol,
        found_us: c.found,
        street: c.street.trim(),
        city: c.city.trim(),
        state: c.state.trim(),
        zip: c.zip.trim(),
        message: msg,
        newsletter: c.newsletter ? "yes" : undefined,
        check_out_date: mode === "overnight" ? end : start,
        rental_mode: mode === "hourly" ? `Hourly (${hours} hours)` : "Overnight",
        estimate_total: q.total,
        spaces: d.spaces.join(", "),
        site_visit_requested: d.tour ? "Yes" : undefined,
        source: "Website booking planner",
      });
      if (!r.ok) throw new Error("bad");
      setStatus({ kind: "", msg: "" });
      go(3);
    } catch {
      setStatus({ kind: "err", msg: `Something went wrong sending your request. Please call or text ${SITE.phone} or email ${SITE.email}, and we'll take it from there.` });
    }
  }

  function downloadIcs() {
    if (!start) return;
    const ics = icsFile({
      title: "The Burland (requested, not yet confirmed)",
      start,
      endExclusive: mode === "overnight" && end ? end : addDays(start, 1),
      description: `Requested ${d.eventType.toLowerCase()} at The Burland. Not reserved until the agreement is signed. Questions: ${SITE.phone}`,
    });
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "the-burland-request.ics" });
    a.click();
    URL.revokeObjectURL(url);
  }

  const set = <K extends keyof Details>(k: K, v: Details[K]) => setD((x) => ({ ...x, [k]: v }));
  const setc = <K extends keyof Contact>(k: K, v: Contact[K]) => setC((x) => ({ ...x, [k]: v }));

  if (!today) return <div className="panel" style={{ minHeight: 420 }} aria-busy="true" />;

  return (
    <div ref={topRef} style={{ scrollMarginTop: 100 }}>
      <nav className="steps no-print" aria-label="Booking steps">
        {STEPS.map((s, i) => (
          <button
            key={s}
            type="button"
            aria-current={step === i ? "step" : undefined}
            className={step > i ? "done" : ""}
            disabled={step === 3 || i === 3 || (i >= 1 && !datesOk) || (i >= 2 && !detailsOk)}
            onClick={() => go(i as Step)}
          >
            <b>{step > i ? "✓" : i + 1}</b>{s}
          </button>
        ))}
      </nav>

      <div className="planner">
        <div className="panel">
          {step === 0 && (
            <div className="form">
              <div className="choice" role="radiogroup" aria-label="Rental type">
                <label><input type="radio" name="mode" checked={mode === "overnight"} onChange={() => { setMode("overnight"); setEnd(null); }} /><span>Overnight stay</span></label>
                <label><input type="radio" name="mode" checked={mode === "hourly"} onChange={() => { setMode("hourly"); setEnd(start); }} /><span>Daytime, by the hour</span></label>
              </div>
              {mode === "hourly" && <p className="notice small">Hourly rentals are $200 for the first hour and $75 for each hour after, Monday through Thursday, October through April.</p>}
              {!avail.live && (
                <p className="notice small">
                  We confirm every date by hand. Want to peek first? See the <Link href="/availability">live availability calendar</Link>.
                </p>
              )}
              <RangeCalendar
                today={today}
                start={start}
                end={mode === "hourly" ? start : end}
                single={mode === "hourly"}
                busy={avail.busy}
                holidays={avail.holidays}
                onChange={(s, e) => { setStart(s); setEnd(mode === "hourly" ? s : e); }}
              />
              {mode === "hourly" && start && (
                <label className="field" style={{ maxWidth: 260 }}>
                  <span>How many hours?</span>
                  <input type="number" min={1} max={12} value={hours} onChange={(e) => setHours(Math.max(1, Math.min(12, Number(e.target.value) || 1)))} />
                </label>
              )}
              {mode === "hourly" && start && !hourlyAllowed(start) && <p className="notice warn small">That date isn&apos;t available by the hour. Try a Monday through Thursday between October and April, or switch to an overnight stay.</p>}
              <div className="row" style={{ justifyContent: "space-between" }}>
                <button type="button" className="btn btn-line btn-sm" onClick={() => { setStart(null); setEnd(null); }}>Clear dates</button>
                <button type="button" className="btn btn-dark" disabled={!datesOk} onClick={() => go(1)}>Next: event details</button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="form">
              <h2 style={{ fontSize: "1.8rem" }}>Tell us about your event</h2>
              <div className="field">
                <span className="legend">What are you planning?</span>
                <div className="choice">
                  {EVENT_TYPES.map((t) => (
                    <label key={t}><input type="radio" name="etype" checked={d.eventType === t} onChange={() => set("eventType", t)} /><span>{t}</span></label>
                  ))}
                </div>
              </div>
              <div className="two">
                <label className="field"><span>Overnight guests (estimate)</span><input type="number" min={0} max={200} inputMode="numeric" value={d.overnight} onChange={(e) => set("overnight", e.target.value)} placeholder="e.g. 32" /></label>
                <label className="field"><span>Most guests in the building at once *</span><input type="number" min={1} max={SITE.maxInBuilding} inputMode="numeric" value={d.maxGuests} onChange={(e) => set("maxGuests", e.target.value)} placeholder="e.g. 60" /></label>
              </div>
              {Number(d.overnight) > 40 && <p className="notice small">The Burland sleeps 40+. Tell us your exact count and we&apos;ll help you plan beds by household.</p>}
              {maxGuests > SITE.maxInBuilding && <p className="notice warn small">The building holds up to {SITE.maxInBuilding} guests at one time. Call or text {SITE.phone} and we&apos;ll talk through options.</p>}
              {d.eventType === "Wedding" && maxGuests > SITE.weddingSeats && maxGuests <= SITE.maxInBuilding && <p className="notice small">Wedding seating is up to about {SITE.weddingSeats}. Up to {SITE.maxInBuilding} can be in the building for a standing reception.</p>}
              <div className="field">
                <span className="legend">Spaces you&apos;re most excited about (optional)</span>
                <div className="choice">
                  {["The whole building", ...SPACES].map((s) => (
                    <label key={s}>
                      <input type="checkbox" checked={d.spaces.includes(s)} onChange={(e) => set("spaces", e.target.checked ? [...d.spaces, s] : d.spaces.filter((x) => x !== s))} />
                      <span>{s}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="field">
                <span className="legend">Decor package</span>
                <div className="choice">
                  {(Object.keys(ADDONS.decor) as DecorKey[]).map((k) => (
                    <label key={k}><input type="radio" name="decor" checked={d.decor === k} onChange={() => set("decor", k)} /><span>{ADDONS.decor[k].label}{ADDONS.decor[k].price ? ` (${fmtUSD(ADDONS.decor[k].price)})` : ""}</span></label>
                  ))}
                </div>
                <p className="small muted" style={{ margin: 0 }}><Link href="/weddings#packages">Compare packages</Link></p>
              </div>
              {d.decor !== "none" && (
                <label className="field" style={{ maxWidth: 300 }}><span>White tablecloths ($10 each, optional)</span><input type="number" min={0} max={40} value={d.tablecloths} onChange={(e) => set("tablecloths", e.target.value)} /></label>
              )}
              <div className="field">
                <span className="legend">Will alcohol be sold or served? *</span>
                <div className="choice">
                  {(["No", "Yes"] as const).map((v) => (
                    <label key={v}><input type="radio" name="alc" checked={d.alcohol === v} onChange={() => set("alcohol", v)} /><span>{v}{v === "Yes" ? " ($200 fee)" : ""}</span></label>
                  ))}
                </div>
              </div>
              <label className="tick"><input type="checkbox" checked={d.tour} onChange={(e) => set("tour", e.target.checked)} />I&apos;d like to tour The Burland before booking.</label>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <button type="button" className="btn btn-line btn-sm" onClick={() => go(0)}>Back</button>
                <button type="button" className="btn btn-dark" disabled={!detailsOk} onClick={() => go(2)}>Next: your info</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <form className="form" onSubmit={(e) => { e.preventDefault(); send(); }} noValidate>
              <h2 style={{ fontSize: "1.8rem" }}>Where should we send your confirmation?</h2>
              <input className="gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" name="_gotcha" />
              <div className="two">
                <label className="field"><span>Full name *</span><input autoComplete="name" value={c.name} onChange={(e) => setc("name", e.target.value)} required /></label>
                <label className="field"><span>Phone</span><input type="tel" autoComplete="tel" value={c.phone} onChange={(e) => setc("phone", e.target.value)} /></label>
              </div>
              <label className="field"><span>Email *</span><input type="email" autoComplete="email" value={c.email} onChange={(e) => setc("email", e.target.value)} required /></label>
              <label className="field"><span>Mailing address *</span><input autoComplete="street-address" value={c.street} onChange={(e) => setc("street", e.target.value)} required /></label>
              <div className="three">
                <label className="field"><span>City *</span><input autoComplete="address-level2" value={c.city} onChange={(e) => setc("city", e.target.value)} required /></label>
                <label className="field"><span>State *</span><input autoComplete="address-level1" value={c.state} onChange={(e) => setc("state", e.target.value)} required /></label>
                <label className="field"><span>ZIP *</span><input autoComplete="postal-code" inputMode="numeric" value={c.zip} onChange={(e) => setc("zip", e.target.value)} required /></label>
              </div>
              <label className="field">
                <span>How did you find us?</span>
                <select value={c.found} onChange={(e) => setc("found", e.target.value)}>{FOUND_US.map((f) => <option key={f}>{f}</option>)}</select>
              </label>
              <label className="field"><span>Anything else we should know?</span><textarea value={c.message} onChange={(e) => setc("message", e.target.value)} placeholder="Family names, special occasions, questions..." /></label>
              <label className="tick"><input type="checkbox" checked={c.newsletter} onChange={(e) => setc("newsletter", e.target.checked)} />Send me occasional Burland news and open dates (optional).</label>
              <label className="tick"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />I understand this is a request. My date is reserved only after I sign the rental agreement and pay the amount due at signing.</label>
              {status.msg && <p className={"notice " + (status.kind === "err" ? "err" : "")} role="status">{status.msg}</p>}
              <div className="row" style={{ justifyContent: "space-between" }}>
                <button type="button" className="btn btn-line btn-sm" onClick={() => go(1)}>Back</button>
                <button type="submit" className="btn btn-brass" disabled={status.kind === "sending"}>Send my request</button>
              </div>
            </form>
          )}

          {step === 3 && start && q && (
            <div>
              <p className="notice ok">Request sent. Thank you, {c.name.split(" ")[0]}!</p>
              <h2 style={{ fontSize: "1.9rem", marginTop: 18 }}>Here&apos;s what happens next</h2>
              <ol className="prose" style={{ paddingLeft: 20 }}>
                <li>We check the calendar and reply personally, usually within one business day.</li>
                <li>We email a short rental details form, then your agreement through SignNow.</li>
                <li>Your date is reserved once you sign and pay {fmtUSD(q.dueAtBooking)} (50%).</li>
                {q.balanceDue && <li>The balance of {fmtUSD(q.balance)} is due by {fmtDate(q.balanceDue)}.</li>}
                <li>Check in from 3:00 p.m. on {fmtDate(start, { weekday: true })}{mode === "overnight" && end ? `, check out by 11:00 a.m. on ${fmtDate(end, { weekday: true })}` : ""}.</li>
              </ol>
              <p className="small muted">Didn&apos;t hear back in two business days? Check your spam folder, or call or text {SITE.phone}.</p>
              <div className="row no-print" style={{ marginTop: 20 }}>
                <button type="button" className="btn btn-dark btn-sm" onClick={downloadIcs}>Add to my calendar</button>
                <button type="button" className="btn btn-line btn-sm" onClick={() => window.print()}>Print this summary</button>
                <Link href="/plan/cost-splitter" className="btn btn-line btn-sm" onClick={() => { try { sessionStorage.setItem("burland-total", String(q.total)); } catch {} }}>Split the cost with family</Link>
              </div>
            </div>
          )}
        </div>

        <EstimateCard q={q} start={start} end={mode === "overnight" ? end : start} title={step === 3 ? "Your request" : "Your estimate"}>
          {step === 0 && datesOk && (
            <button type="button" className="btn btn-brass" style={{ width: "100%", marginTop: 16 }} onClick={() => go(1)}>Continue</button>
          )}
        </EstimateCard>
      </div>
    </div>
  );
}
