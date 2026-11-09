"use client";
import { useEffect, useRef, useState } from "react";
import { submitForm, validEmail } from "@/lib/forms";
import { EVENT_TYPES, FOUND_US, SITE } from "@/lib/site";

// Questions and tour requests. Sends a regular inquiry to the existing Apps Script.
export function ContactForm() {
  const t0 = useRef(Date.now());
  const [tour, setTour] = useState(false);
  const [status, setStatus] = useState<{ kind: "" | "ok" | "err" | "sending"; msg: string }>({ kind: "", msg: "" });
  useEffect(() => { if (new URLSearchParams(location.search).get("tour")) setTour(true); }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const g = (k: string) => String(f.get(k) ?? "").trim();
    if (!g("name") || !validEmail(g("email"))) return setStatus({ kind: "err", msg: "Please add your name and a valid email address." });
    setStatus({ kind: "sending", msg: "Sending..." });
    const message = [tour ? `TOUR REQUEST. Preferred times: ${g("tour_times") || "flexible"}` : "", g("message")].filter(Boolean).join("\n\n");
    try {
      const r = await submitForm("inquiry", t0.current, {
        name: g("name"),
        email: g("email"),
        phone: g("phone"),
        event_type: g("event_type"),
        booking_date: g("booking_date") || undefined,
        found_us: g("found_us"),
        message,
        site_visit_requested: tour ? "Yes" : undefined,
        source: tour ? "Website tour request" : "Website contact form",
        _gotcha: g("_gotcha") || undefined,
      });
      if (!r.ok) throw new Error();
      setStatus({ kind: "ok", msg: tour ? "Thanks! We'll reach out personally to set up your visit, usually within one business day." : "Thanks! We'll reply personally, usually within one business day." });
      e.currentTarget?.reset();
    } catch {
      setStatus({ kind: "err", msg: `Something went wrong. Please call or text ${SITE.phone} or email ${SITE.email}.` });
    }
  }

  return (
    <form className="form panel" onSubmit={onSubmit} noValidate>
      <div className="choice" role="radiogroup" aria-label="What do you need?">
        <label><input type="radio" name="kind" checked={!tour} onChange={() => setTour(false)} /><span>Ask a question</span></label>
        <label><input type="radio" name="kind" checked={tour} onChange={() => setTour(true)} /><span>Schedule a tour</span></label>
      </div>
      <input className="gotcha" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <div className="two">
        <label className="field"><span>Name *</span><input name="name" autoComplete="name" required /></label>
        <label className="field"><span>Email *</span><input name="email" type="email" autoComplete="email" required /></label>
      </div>
      <div className="two">
        <label className="field"><span>Phone</span><input name="phone" type="tel" autoComplete="tel" /></label>
        <label className="field"><span>Event type</span><select name="event_type">{EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
      </div>
      <div className="two">
        <label className="field"><span>Event date, if you have one</span><input name="booking_date" type="date" /></label>
        <label className="field"><span>How did you find us?</span><select name="found_us">{FOUND_US.map((t) => <option key={t}>{t}</option>)}</select></label>
      </div>
      {tour && <label className="field"><span>When could you visit?</span><input name="tour_times" placeholder="e.g. Saturday mornings, or weekdays after 5" /></label>}
      <label className="field"><span>{tour ? "Anything you'd like to see?" : "Your question"}</span><textarea name="message" /></label>
      {status.msg && <p className={"notice " + (status.kind === "ok" ? "ok" : status.kind === "err" ? "err" : "")} role="status">{status.msg}</p>}
      <button className="btn btn-brass" type="submit" disabled={status.kind === "sending"}>{tour ? "Request a tour" : "Send message"}</button>
    </form>
  );
}
