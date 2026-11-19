"use client";
import { useEffect, useState, type ReactNode } from "react";

// SHA-256 of the lowercase guest password, so the word itself isn't sitting in the page source.
// This keeps casual visitors out; it is not strong security, so nothing private belongs behind it.
const PASS_HASH = "a833aa0bb8297d88979b9dc37c8112d77b02922db958e7edde6bfe5b1615126b";
const KEY = "burland-guest-ok";

async function sha256(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function GuestGate({ children }: { children: ReactNode }) {
  const [ok, setOk] = useState(false);
  const [ready, setReady] = useState(false);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    try { setOk(localStorage.getItem(KEY) === PASS_HASH); } catch {}
    setReady(true);
  }, []);

  const tryIt = async () => {
    if ((await sha256(pw.trim().toLowerCase())) === PASS_HASH) {
      try { localStorage.setItem(KEY, PASS_HASH); } catch {}
      setOk(true);
    } else {
      setErr("That's not quite it. Check with Alan or Milly for the password.");
    }
  };

  if (!ready) return null;
  if (ok) return <>{children}</>;
  return (
    <section style={{ paddingTop: 160, paddingBottom: 80 }}>
      <div className="container narrow" style={{ maxWidth: 520 }}>
        <div className="eyebrow">Be Our Guest</div>
        <h1 style={{ fontSize: "clamp(2rem,4vw,2.8rem)" }}>Welcome, friend</h1>
        <p className="lede" style={{ marginBottom: 24 }}>This page is just for friends of the family. Enter the password we shared with you.</p>
        <form className="panel" style={{ display: "grid", gap: 12 }} onSubmit={(e) => { e.preventDefault(); tryIt(); }}>
          <label className="field">
            <span>Password</span>
            <input className="input" type="password" autoComplete="off" autoFocus value={pw} onChange={(e) => { setPw(e.target.value); setErr(""); }} />
          </label>
          <button type="submit" className="btn btn-dark" disabled={!pw.trim()}>Come on in</button>
          {err && <p className="small" role="alert" style={{ margin: 0 }}>{err}</p>}
        </form>
      </div>
    </section>
  );
}
