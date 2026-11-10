import Link from "next/link";
import { CtaBand, Faq, PageHero } from "@/components/Blocks";
import { Picture } from "@/components/Picture";
import { JsonLd } from "@/components/JsonLd";
import { FAQS } from "@/lib/content";
import { crumbsSchema, faqSchema, meta } from "@/lib/seo";
import { PACKAGES, fmtUSD } from "@/lib/site";

export const metadata = meta({
  title: "Wedding and Reception Venue near Rexburg, Idaho",
  description: "An intimate historic wedding venue in St. Anthony, Idaho, about 15 minutes from both Rexburg temples. Ceremony and reception on site, bridal suite, overnight stays, and decor packages from $200.",
  path: "/weddings",
  image: "img-ballroom-tables",
});

const DETAILS = [
  ["Seating", "Up to about 100 guests, intimate by design"],
  ["Ceremony and reception", "Both on site. The space converts quickly between the two."],
  ["Getting ready", "Bridal suite and groom's lounge, separate spaces on site"],
  ["Overnight stays", "Family and wedding party can stay together on site"],
  ["Rexburg temples", "About 15 minutes away"],
  ["Location", "Downtown St. Anthony, easy from Rexburg and Idaho Falls"],
  ["Parking", "Off-site parking available"],
  ["Accessibility", "ADA accessible"],
];

const AMENITIES = ["Tables and chairs", "Dance floor", "Sound system and PA", "Lighting options", "Photo backdrops", "Prep kitchen access", "Bridal suite", "Groom's lounge", "Decor rentals", "Decor setup and teardown", "Venue host", "Heating and cooling", "Wi-Fi", "Restrooms", "Trash and cleanup", "Flexible vendor policy", "ADA accessibility"];

const wedFaqs = FAQS.filter((f) => f.tag === "events");

export default function Weddings() {
  return (
    <>
      <PageHero img="img-wood-stack-wall" eyebrow="Weddings and receptions" title="Where your wedding feels like family" lede="A restored 1912 building in downtown St. Anthony. Warm, intimate, and full of the people who matter most." short={false} crumbs={[{ name: "Weddings", href: "/weddings" }]}>
        <div className="row" style={{ marginTop: 24 }}>
          <Link href="/book?type=Wedding" className="btn btn-brass">Check wedding dates</Link>
          <Link href="/contact?tour=1" className="btn btn-ghost">Book a tour</Link>
        </div>
      </PageHero>

      <section>
        <div className="container split">
          <div>
            <div className="eyebrow">A different kind of venue</div>
            <h2>Not a convention hall with flowers</h2>
            <p className="lede">With over 10,000 square feet across three floors, there&apos;s room for every generation to be part of your day, from Grandpa&apos;s toast to the flower girl&apos;s dance moves.</p>
            <p>Planning a temple wedding? Both Rexburg temples are about 15 minutes away, so the celebration starts the moment your family arrives. And because The Burland sleeps 40+, out-of-town family can stay right here instead of scattering to hotels.</p>
          </div>
          <div className="stack">
            <div className="media"><Picture src="img-ballroom-tables" sizes="(max-width: 860px) 100vw, 50vw" /></div>
            <div className="media"><Picture src="img-table-centerpiece" sizes="25vw" /></div>
          </div>
        </div>
      </section>

      <section className="sand" id="packages">
        <div className="container">
          <div className="section-head center"><div className="eyebrow">Decor packages</div><h2>Pick the help you want</h2><p className="muted">Tables and chairs come with every rental. A package adds linens, decor, and setup help.</p></div>
          <div className="grid g2" style={{ maxWidth: 920, margin: "0 auto" }}>
            {PACKAGES.map((p) => (
              <div key={p.key} className="card" style={p.key === "deluxe" ? { borderColor: "var(--brass)", borderWidth: 2 } : undefined}>
                {p.key === "deluxe" && <span className="chip">Most popular for weddings</span>}
                <h3 style={{ marginTop: 10 }}>{p.name}</h3>
                <p className="muted">{p.blurb}</p>
                <div className="stat">{fmtUSD(p.price)}<span className="small muted" style={{ fontFamily: "var(--body)" }}> per event</span></div>
                <ul className="check" style={{ margin: "18px 0 24px" }}>{p.items.map((i) => <li key={i}>{i}</li>)}</ul>
                <Link href="/book?type=Wedding" className={"btn " + (p.key === "deluxe" ? "btn-brass" : "btn-dark")}>Start with this package</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="container grid g2" style={{ alignItems: "start" }}>
          <div>
            <h2>The details</h2>
            <div className="table-wrap"><table><tbody>{DETAILS.map(([k, v]) => <tr key={k}><th style={{ width: "38%" }}>{k}</th><td>{v}</td></tr>)}</tbody></table></div>
          </div>
          <div>
            <h2>What you&apos;ll find here</h2>
            <ul className="check cols-2">{AMENITIES.map((a) => <li key={a}>{a}</li>)}</ul>
            <p className="small muted" style={{ marginTop: 18 }}>We&apos;ll confirm exactly what comes with your rental and which package fits your plans.</p>
          </div>
        </div>
      </section>

      <section className="dark">
        <div className="container split flip">
          <div>
            <div className="eyebrow">Free guide</div>
            <h2>The calm wedding plan</h2>
            <p>A 12 to 18 month checklist for budget, guest list, vendors, and the day-of timeline. Print it or save it as a PDF.</p>
            <Link href="/guides" className="btn btn-brass">Get the wedding guide</Link>
          </div>
          <div className="media"><Picture src="img-ballroom-chandeliers" sizes="(max-width: 860px) 100vw, 50vw" /></div>
        </div>
      </section>

      <section>
        <div className="container narrow"><div className="section-head center"><h2>Wedding questions</h2></div><Faq items={wedFaqs} /></div>
      </section>
      <JsonLd data={faqSchema(wedFaqs)} />
      <JsonLd data={crumbsSchema([{ name: "Weddings", path: "/weddings" }])} />
      <CtaBand title="Ready to plan your day?" text="See open dates and your full estimate, or come walk the building with us." img="img-ballroom-wide" />
    </>
  );
}
