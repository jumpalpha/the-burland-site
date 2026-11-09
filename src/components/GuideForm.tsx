"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { submitForm, validEmail } from "@/lib/forms";
import { SITE } from "@/lib/site";

const OPTIONS = ["Family Reunion Planning Guide", "Wedding Planning Guide", "Both guides"];

export function GuideForm() {
  const t0 = useRef(Date.now());
  const [email, setEmail] = useState("");
  const [pick, setPick] = useState(OPTIONS[0]);
  const [msg, setMsg] = useState("");
  const [done, setDone] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validEmail(email)) return setMsg("Please enter a valid email address.");
    setMsg("Sending...");
    try {
      const r = await submitForm("guide", t0.current, { email: email.trim(), guide_requested: pick });
      if (!r.ok) throw new Error();
      setMsg("Thank you. Your guide is ready below.");
      setDone(pick);
    } catch {
      setMsg(`Something went wrong. Please email ${SITE.email} and we will send the guide.`);
    }
  }

  return (
    <div className="panel">
      <form className="form" onSubmit={onSubmit} noValidate>
        <h2 style={{ fontSize: "1.6rem", margin: 0 }}>Where should we send your free guide?</h2>
        <p className="muted small" style={{ margin: 0 }}>Your download appears right away. We use your email only to follow up about The Burland. No spam.</p>
        <label className="field"><span>Email address</span><input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <div className="choice">{OPTIONS.map((o) => <label key={o}><input type="radio" name="g" checked={pick === o} onChange={() => setPick(o)} /><span>{o}</span></label>)}</div>
        <button className="btn btn-brass" type="submit">Send my guide</button>
        {msg && <p className="notice small" role="status">{msg}</p>}
      </form>
      {done && (
        <div className="row" style={{ marginTop: 18 }}>
          {done !== "Wedding Planning Guide" && <Link className="btn btn-dark" href="/guide-reunion">Open the Family Reunion Guide</Link>}
          {done !== "Family Reunion Planning Guide" && <Link className="btn btn-dark" href="/guide-wedding">Open the Wedding Guide</Link>}
        </div>
      )}
    </div>
  );
}
