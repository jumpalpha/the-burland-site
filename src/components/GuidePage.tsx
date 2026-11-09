"use client";
import Link from "next/link";
import type { Guide } from "@/lib/guides";
import { SITE } from "@/lib/site";

export function GuidePage({ g, other }: { g: Guide; other: { href: string; label: string } }) {
  return (
    <section style={{ paddingTop: 140 }}>
      <div className="container narrow">
        <div className="eyebrow">Free planning guide</div>
        <h1 style={{ fontSize: "clamp(2.2rem,4.5vw,3.2rem)" }}>{g.title}</h1>
        <p className="lede">{g.lede}</p>
        <div className="row no-print" style={{ margin: "20px 0 36px" }}>
          <button type="button" className="btn btn-dark btn-sm" onClick={() => window.print()}>Print or save as PDF</button>
          <Link href={other.href} className="btn btn-line btn-sm">{other.label}</Link>
        </div>
        <div className="prose">
          {g.sections.map((s) => (
            <div key={s.h}>
              <h2 style={{ fontSize: "1.6rem" }}>{s.h}</h2>
              <ul className="check">{s.items.map((i) => <li key={i}>{i}</li>)}</ul>
            </div>
          ))}
          <h2 style={{ fontSize: "1.6rem" }}>Timeline checklist</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {g.timeline.map((t) => <li key={t}><label className="tick"><input type="checkbox" />{t}</label></li>)}
          </ul>
          <div className="card" style={{ marginTop: 36 }}>
            <h3>Questions? We are happy to help.</h3>
            <p className="muted" style={{ margin: 0 }}>The Burland, St. Anthony, Idaho. Call or text {SITE.phone}, email {SITE.email}, or visit theburland.com.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
