import Link from "next/link";
import { Faq } from "@/components/Blocks";
import { JsonLd } from "@/components/JsonLd";
import { FAQS } from "@/lib/content";
import { crumbsSchema, faqSchema, meta } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = meta({
  title: "Frequently Asked Questions",
  description: "Answers about booking, pricing, capacity, the kitchen, weddings, alcohol, and things to do near The Burland in St. Anthony, Idaho.",
  path: "/faq",
});

const TAGS = { booking: "Booking and pricing", stay: "Your stay", events: "Weddings and events", area: "The area" } as const;

export default function FaqPage() {
  return (
    <section style={{ paddingTop: 140 }}>
      <div className="container narrow">
        <div className="eyebrow">FAQ</div>
        <h1 style={{ fontSize: "clamp(2.2rem,4.5vw,3.4rem)" }}>Questions, answered</h1>
        <p className="lede">Can&apos;t find what you need? Call or text <a href={`tel:${SITE.phone}`}>{SITE.phone}</a> or <Link href="/contact">send us a note</Link>.</p>
        {(Object.keys(TAGS) as (keyof typeof TAGS)[]).map((t) => (
          <div key={t} style={{ marginTop: 40 }}>
            <h2 style={{ fontSize: "1.6rem" }}>{TAGS[t]}</h2>
            <Faq items={FAQS.filter((f) => f.tag === t)} />
          </div>
        ))}
      </div>
      <JsonLd data={faqSchema()} />
      <JsonLd data={crumbsSchema([{ name: "FAQ", path: "/faq" }])} />
    </section>
  );
}
