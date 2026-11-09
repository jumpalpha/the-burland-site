"use client";
import { useEffect, useRef, useState } from "react";
import { prefill, submitForm, validEmail } from "@/lib/forms";
import { addDays, todayLocal } from "@/lib/dates";
import { ADDONS, SITE, SPACES } from "@/lib/site";

type V = Record<string, string>;
const init: V = { name: "", phone: "", email: "", street: "", city: "", state: "", zip: "", purpose: "", start_date: "", check_in: "15:00", end_date: "", check_out: "11:00", max_guests: "", decorations: "None", alcohol: "No", message: "", inquiry_ref: "" };

export function RentalForm() {
  const t0 = useRef(Date.now());
  const [v, setV] = useState<V>(init);
  const [rooms, setRooms] = useState<string[]>([]);
  const [alc, setAlc] = useState<string[]>([]);
  const [agree, setAgree] = useState(false);
  const [today, setToday] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<{ kind: "" | "ok" | "err" | "sending"; msg: string }>({ kind: "", msg: "" });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setV((x) => ({ ...x, [k]: e.target.value }));

  useEffect(() => {
    setToday(todayLocal());
    // The owner's email links here with #r=CODE. The Apps Script looks it up, so no personal details travel in the link.
    const ref = new URLSearchParams(location.hash.slice(1)).get("r");
    if (!ref || !/^[A-Za-z0-9]{8,40}$/.test(ref)) return;
    prefill(ref)
      .then((d) => {
        setV((x) => {
          const n = { ...x };
          for (const k of ["name", "phone", "email", "street", "city", "state", "zip", "max_guests"]) if (d[k]) n[k] = String(d[k]);
          if (d.event_type) n.purpose = d.event_type;
          if (/^\d{4}-\d{2}-\d{2}$/.test(d.booking_date || "")) {
            n.start_date = d.booking_date;
            n.end_date = addDays(d.booking_date, parseInt(d.nights, 10) || 0);
          }
          if (d.addons) n.decorations = d.addons;
          if (d.alcohol === "Yes" || d.alcohol === "No") n.alcohol = d.alcohol;
          if (d.message) n.message = d.message;
          n.inquiry_ref = ref;
          return n;
        });
        setNote(`We filled in what you sent us. Please check it, then add your check-out time and the spaces you'd like${d.alcohol === "Yes" ? ", and the types of alcohol." : "."}`);
      })
      .catch(() => setNote("We couldn't load your earlier details. Please fill in the form below."));
  }, []);

  const allRooms = rooms.length === SPACES.length;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const req = ["name", "phone", "email", "street", "city", "state", "zip", "purpose", "start_date", "end_date", "max_guests"];
    if (req.some((k) => !v[k].trim())) return setStatus({ kind: "err", msg: "Please fill in every field marked with *." });
    if (!rooms.length) return setStatus({ kind: "err", msg: "Please choose at least one space." });
    if (v.end_date < v.start_date) return setStatus({ kind: "err", msg: "The departure date can't be before the arrival date." });
    if (!validEmail(v.email)) return setStatus({ kind: "err", msg: "Please enter a valid email address." });
    if (v.alcohol === "Yes" && !alc.length) return setStatus({ kind: "err", msg: "Please check at least one type of alcohol." });
    if (!agree) return setStatus({ kind: "err", msg: "Please confirm the details are accurate." });
    setStatus({ kind: "sending", msg: "Sending..." });
    try {
      const r = await submitForm("rental", t0.current, { ...v, rooms: rooms.join(", "), alcohol_types: v.alcohol === "Yes" ? alc.join(", ") : "" });
      if (!r.ok) throw new Error();
      setStatus({ kind: "ok", msg: "Thank you. We received your details and will email your rental agreement from SignNow, usually within one or two business days. Please check your spam folder if you don't see it." });
      setV(init); setRooms([]); setAlc([]); setAgree(false); setNote("");
    } catch {
      setStatus({ kind: "err", msg: `Something went wrong. Please call or text ${SITE.phone} or email ${SITE.email}.` });
    }
  }

  return (
    <form className="form panel" onSubmit={onSubmit} noValidate>
      {note && <p className="notice">{note}</p>}
      <h2 style={{ fontSize: "1.5rem", margin: 0 }}>About you</h2>
      <label className="field"><span>Full name (the person signing the agreement) *</span><input value={v.name} onChange={set("name")} autoComplete="name" /></label>
      <div className="two">
        <label className="field"><span>Phone *</span><input type="tel" value={v.phone} onChange={set("phone")} autoComplete="tel" /></label>
        <label className="field"><span>Email (SignNow sends the agreement here) *</span><input type="email" value={v.email} onChange={set("email")} autoComplete="email" /></label>
      </div>
      <label className="field"><span>Mailing address *</span><input value={v.street} onChange={set("street")} autoComplete="street-address" /></label>
      <div className="three">
        <label className="field"><span>City *</span><input value={v.city} onChange={set("city")} autoComplete="address-level2" /></label>
        <label className="field"><span>State *</span><input value={v.state} onChange={set("state")} autoComplete="address-level1" /></label>
        <label className="field"><span>ZIP *</span><input value={v.zip} onChange={set("zip")} autoComplete="postal-code" /></label>
      </div>
      <h2 style={{ fontSize: "1.5rem", margin: "12px 0 0" }}>Your event</h2>
      <label className="field"><span>Event or purpose *</span><input value={v.purpose} onChange={set("purpose")} /></label>
      <div className="two">
        <label className="field"><span>Arrival date *</span><input type="date" min={today} value={v.start_date} onChange={(e) => setV((x) => ({ ...x, start_date: e.target.value, end_date: !x.end_date || x.end_date < e.target.value ? e.target.value : x.end_date }))} /></label>
        <label className="field"><span>Check-in time *</span><input type="time" value={v.check_in} onChange={set("check_in")} /></label>
      </div>
      <div className="two">
        <label className="field"><span>Departure date (same day for a one-day event) *</span><input type="date" min={v.start_date || today} value={v.end_date} onChange={set("end_date")} /></label>
        <label className="field"><span>Check-out time *</span><input type="time" value={v.check_out} onChange={set("check_out")} /></label>
      </div>
      <label className="field" style={{ maxWidth: 360 }}><span>Most guests in the building at one time (max {SITE.maxInBuilding}) *</span><input type="number" min={1} max={SITE.maxInBuilding} value={v.max_guests} onChange={set("max_guests")} /></label>
      <div className="field">
        <span className="legend">Spaces you would like *</span>
        <div className="choice">
          <label><input type="checkbox" checked={allRooms} onChange={(e) => setRooms(e.target.checked ? [...SPACES] : [])} /><span>The whole building</span></label>
          {SPACES.map((s) => (
            <label key={s}><input type="checkbox" checked={rooms.includes(s)} onChange={(e) => setRooms(e.target.checked ? [...rooms, s] : rooms.filter((x) => x !== s))} /><span>{s}</span></label>
          ))}
        </div>
      </div>
      <div className="two">
        <label className="field"><span>Decorations</span><select value={v.decorations} onChange={set("decorations")}>{Object.values(ADDONS.decor).map((d) => <option key={d.formValue}>{d.formValue}</option>)}</select></label>
        <label className="field"><span>Will alcohol be sold or served?</span><select value={v.alcohol} onChange={(e) => { set("alcohol")(e); if (e.target.value !== "Yes") setAlc([]); }}><option>No</option><option>Yes</option></select></label>
      </div>
      {v.alcohol === "Yes" && (
        <div className="field">
          <span className="legend">Which types? (alcohol rules and the alcohol fee are in the agreement)</span>
          <div className="choice">{["Beer", "Wine", "Liquor"].map((a) => <label key={a}><input type="checkbox" checked={alc.includes(a)} onChange={(e) => setAlc(e.target.checked ? [...alc, a] : alc.filter((x) => x !== a))} /><span>{a}</span></label>)}</div>
        </div>
      )}
      <label className="field"><span>Anything else we should know?</span><textarea value={v.message} onChange={set("message")} /></label>
      <label className="tick"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />The information above is accurate. I understand my date is reserved only after I sign the agreement and pay the amount due at signing.</label>
      {status.msg && <p className={"notice " + (status.kind === "ok" ? "ok" : status.kind === "err" ? "err" : "")} role="status">{status.msg}</p>}
      <button className="btn btn-brass" type="submit" disabled={status.kind === "sending"}>Send my details</button>
      <p className="small muted" style={{ margin: 0 }}>We review every request personally and send the agreement by email from SignNow. Questions: call or text {SITE.phone}.</p>
    </form>
  );
}
