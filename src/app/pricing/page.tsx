import Link from "next/link";
import { CtaBand, Faq, PageHero } from "@/components/Blocks";
import { JsonLd } from "@/components/JsonLd";
import { FAQS } from "@/lib/content";
import { crumbsSchema, faqSchema, meta } from "@/lib/seo";
import { ADDONS, POLICY, RATES, fmtUSD } from "@/lib/site";

export const metadata = meta({
  title: "Pricing and Rates",
  description: "Whole-building rates for The Burland in St. Anthony, Idaho. Off-season from $800 a night, peak season from $1,200, hourly off-season weekdays, plus deposit and payment policies.",
  path: "/pricing",
  image: "img-dining-area",
});

const peakExamples = [
  ["Any 2 weeknights, Monday to Thursday", 2, 2 * RATES.peak.weeknight],
  ["Any 2 weekend nights, Friday to Sunday", 2, 2 * RATES.peak.weekend],
  ["One weeknight plus one weekend night (like Thursday and Friday)", 2, RATES.peak.weeknight + RATES.peak.weekend],
  ["Monday, Tuesday, Wednesday", 3, 3 * RATES.peak.weeknight],
  ["Friday, Saturday, Sunday", 3, 3 * RATES.peak.weekend],
  ["Monday to Thursday", 4, 4 * RATES.peak.weeknight],
  ["Thursday to Sunday", 4, RATES.peak.weeknight + 3 * RATES.peak.weekend],
] as const;

const priceFaqs = FAQS.filter((f) => f.tag === "booking");

export default function Pricing() {
  return (
    <>
      <PageHero img="img-dining-area" eyebrow="Pricing" title="Simple, upfront rates" lede="One price for the whole building, set by the season and the nights you stay. See your exact estimate in seconds." crumbs={[{ name: "Pricing", href: "/pricing" }]}>
        <div className="row" style={{ marginTop: 24 }}><Link href="/book" className="btn btn-brass">Get my instant estimate</Link></div>
      </PageHero>

      <section>
        <div className="container grid g2" style={{ alignItems: "start" }}>
          <div className="card">
            <span className="chip">October to April</span>
            <h2 style={{ marginTop: 12 }}>Off-season</h2>
            <div className="table-wrap" style={{ border: 0 }}>
              <table>
                <thead><tr><th>Stay</th><th>Rate</th><th>Minimum</th></tr></thead>
                <tbody>
                  <tr><td>Monday to Thursday nights</td><td className="amt">{fmtUSD(RATES.off.weeknight)} / night</td><td>None</td></tr>
                  <tr><td>Friday to Sunday nights</td><td className="amt">{fmtUSD(RATES.off.weekend)} / night</td><td>2 nights</td></tr>
                  <tr><td>Holidays</td><td className="amt">{fmtUSD(RATES.off.holiday)} / night</td><td>3 nights</td></tr>
                  <tr><td>Hourly, Monday to Thursday</td><td className="amt">{fmtUSD(RATES.hourly.first)} first hour, then {fmtUSD(RATES.hourly.additional)} / hour</td><td>None</td></tr>
                </tbody>
              </table>
            </div>
            <p className="small muted" style={{ marginTop: 12 }}>Winter is our best-kept secret: cozy weekends, snowmobiling in Island Park, and the lowest rates of the year.</p>
          </div>
          <div className="card">
            <span className="chip">May to September</span>
            <h2 style={{ marginTop: 12 }}>Peak season</h2>
            <div className="table-wrap" style={{ border: 0 }}>
              <table>
                <thead><tr><th>Stay</th><th>Nights</th><th>Total</th></tr></thead>
                <tbody>
                  {peakExamples.map(([label, n, total]) => (
                    <tr key={label}><td>{label}</td><td>{n}</td><td className="amt">{fmtUSD(total)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="small muted" style={{ marginTop: 12 }}>{fmtUSD(RATES.peak.weeknight)} per weeknight and {fmtUSD(RATES.peak.weekend)} per weekend night. Every peak stay has a 2-night minimum and there are no hourly rentals in peak season. Other combinations? The <Link href="/book">estimator</Link> adds them up for you.</p>
          </div>
        </div>
      </section>

      <section className="sand">
        <div className="container grid g2" style={{ alignItems: "start" }}>
          <div>
            <div className="eyebrow">Add-ons</div>
            <h2>Optional extras</h2>
            <p>Tables and chairs come with every rental at no extra cost.</p>
            <ul className="check">
              <li>Basic decor package: {fmtUSD(ADDONS.decor.basic.price)} per event</li>
              <li>Deluxe Celebration package with staff setup: {fmtUSD(ADDONS.decor.deluxe.price)} per event</li>
              <li>White tablecloths: {fmtUSD(ADDONS.whiteTablecloth)} each</li>
              <li>Alcohol fee, when alcohol is served: {fmtUSD(ADDONS.alcohol)}</li>
            </ul>
            <p style={{ marginTop: 16 }}><Link href="/weddings#packages">See what&apos;s in each package</Link></p>
          </div>
          <div>
            <div className="eyebrow">Payment and policies</div>
            <h2>How payment works</h2>
            <ul className="check">
              <li>{POLICY.bookingPercent * 100}% due when you book</li>
              <li>Remaining balance due {POLICY.balanceDaysBefore} days before arrival</li>
              <li>{fmtUSD(POLICY.securityDeposit)} refundable security deposit. After your stay you get {fmtUSD(POLICY.securityDeposit - POLICY.cleaningFee)} back if there&apos;s no damage, since {fmtUSD(POLICY.cleaningFee)} covers cleaning.</li>
              <li>Check-in begins at 3:00 p.m. and check-out is 11:00 a.m.</li>
              <li>Every total is confirmed in writing before you sign.</li>
            </ul>
            <div className="eyebrow" style={{ marginTop: 32 }}>Cancellation</div>
            <ul className="check">
              <li>Payments are non-refundable.</li>
              <li>If we can rebook your dates, all but $500 is refunded. Let us know as soon as possible if your plans change.</li>
            </ul>
            <div className="eyebrow" style={{ marginTop: 32 }}>House rules</div>
            <ul className="check">
              <li>No smoking, no pets, no discharge of firearms.</li>
              <li>Quiet time is 10:00 p.m.</li>
              <li>Please remove shoes indoors when possible.</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <div className="container narrow">
          <div className="section-head center"><h2>Pricing questions</h2></div>
          <Faq items={priceFaqs} />
        </div>
      </section>
      <JsonLd data={faqSchema(priceFaqs)} />
      <JsonLd data={crumbsSchema([{ name: "Pricing", path: "/pricing" }])} />
      <CtaBand title="See your exact price" text="Pick your dates and the estimator applies the season, minimums, and add-ons for you." />
    </>
  );
}
