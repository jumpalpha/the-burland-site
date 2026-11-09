import Link from "next/link";
import { Picture } from "./Picture";
import { FAQS } from "@/lib/content";
import { SITE } from "@/lib/site";

export function PageHero({ img, eyebrow, title, lede, children, short = true, crumbs }: { img: string; eyebrow?: string; title: string; lede?: string; children?: React.ReactNode; short?: boolean; crumbs?: { name: string; href: string }[] }) {
  return (
    <section className={"hero" + (short ? " short" : "")}>
      <div className="bg">
        <Picture src={img} alt="" priority />
      </div>
      <div className="container">
        {crumbs && (
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            {crumbs.map((c) => (
              <span key={c.href}>
                {" / "}
                <Link href={c.href}>{c.name}</Link>
              </span>
            ))}
          </nav>
        )}
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {lede && <p className="lede">{lede}</p>}
        {children}
      </div>
    </section>
  );
}

export function CtaBand({ title = "Let's find your dates", text = "Pick your dates and see an instant estimate. We'll confirm everything personally.", img = "img-ballroom-wide" }: { title?: string; text?: string; img?: string }) {
  return (
    <section className="hero short" style={{ minHeight: 420, alignItems: "center" }}>
      <div className="bg">
        <Picture src={img} alt="" />
      </div>
      <div className="container center">
        <h2 style={{ color: "#fff" }}>{title}</h2>
        <p className="lede" style={{ color: "rgba(255,255,255,.9)", margin: "0 auto 28px" }}>{text}</p>
        <div className="row">
          <Link href="/book" className="btn btn-brass">Plan &amp; Book</Link>
          <a href={`tel:${SITE.phone}`} className="btn btn-ghost">Call or text {SITE.phone}</a>
        </div>
      </div>
    </section>
  );
}

export function Faq({ items = FAQS }: { items?: typeof FAQS }) {
  return (
    <div className="faq">
      {items.map((f) => (
        <details key={f.q}>
          <summary>{f.q}</summary>
          <p>{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function StickyCta() {
  return (
    <div className="sticky-cta no-print">
      <a href={`tel:${SITE.phone}`} className="btn btn-ghost">Call / Text</a>
      <Link href="/book" className="btn btn-brass">Check dates</Link>
    </div>
  );
}
