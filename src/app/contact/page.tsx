import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { JsonLd } from "@/components/JsonLd";
import { crumbsSchema, meta } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = meta({
  title: "Contact Us and Schedule a Tour",
  description: "Call or text 208-709-1403, email burlandevents@gmail.com, or schedule a tour of The Burland in St. Anthony, Idaho.",
  path: "/contact",
});

export default function Contact() {
  return (
    <section style={{ paddingTop: 140 }}>
      <div className="container split" style={{ alignItems: "start" }}>
        <div>
          <div className="eyebrow">Contact</div>
          <h1 style={{ fontSize: "clamp(2.2rem,4.5vw,3.4rem)" }}>Let&apos;s talk about your gathering</h1>
          <p className="lede">Ask us anything or come walk the building. We answer every message personally.</p>
          <div className="grid" style={{ gap: 14, margin: "28px 0" }}>
            <a className="card tool-card" href={`tel:${SITE.phone}`}><strong>Call or text</strong><span className="muted">{SITE.phone}</span></a>
            <a className="card tool-card" href={`mailto:${SITE.email}`}><strong>Email</strong><span className="muted">{SITE.email}</span></a>
            <div className="card"><strong>Location</strong><p className="muted" style={{ margin: 0 }}>Downtown St. Anthony, Idaho. Call or text for directions.</p></div>
          </div>
          <p className="muted">Ready to pick dates? The <Link href="/book">booking planner</Link> shows your price instantly. Already have your date set with us? <Link href="/rental">Send your rental agreement details</Link>.</p>
        </div>
        <ContactForm />
      </div>
      <JsonLd data={crumbsSchema([{ name: "Contact", path: "/contact" }])} />
    </section>
  );
}
