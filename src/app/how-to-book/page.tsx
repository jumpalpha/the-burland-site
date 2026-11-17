import Link from "next/link";
import { RentalForm } from "@/components/RentalForm";
import { BOOKING_STEPS } from "@/lib/content";
import { meta } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = meta({
  title: "How to Book The Burland",
  description: "Five simple steps to book The Burland in St. Anthony, Idaho: pick your dates, we confirm personally, fill out your rental details, sign through SignNow, and pay to reserve.",
  path: "/how-to-book",
});

export default function HowToBook() {
  return (
    <>
      <section style={{ paddingTop: 128 }}>
        <div className="container narrow">
          <div className="eyebrow">How to book</div>
          <h1 style={{ fontSize: "clamp(2.2rem,4.5vw,3.2rem)" }}>Booking in five simple steps</h1>
          <p className="lede">No surprises and nothing automatic. A real person confirms every date, and you&apos;ll know exactly what you owe and when before you sign anything. Questions at any step? Call or text <a href={`tel:${SITE.phone}`}>{SITE.phone}</a>.</p>

          <ol className="howto">
            {BOOKING_STEPS.map((s, i) => (
              <li key={s.t}>
                <span className="howto-num" aria-hidden="true">{i + 1}</span>
                <div>
                  <h2>{s.t}</h2>
                  <p>{s.d}</p>
                  {s.href && (s.href.startsWith("#")
                    ? <a href={s.href} className="btn btn-line btn-sm">{s.cta}</a>
                    : <Link href={s.href} className="btn btn-dark btn-sm">{s.cta}</Link>)}
                </div>
              </li>
            ))}
          </ol>

          <div className="card" style={{ marginTop: 8 }}>
            <h2 style={{ fontSize: "1.3rem", marginTop: 0 }}>After your stay</h2>
            <p className="muted" style={{ margin: 0 }}>Your $1,000 security deposit comes back after the stay, minus a $250 cleaning fee. If there&apos;s no damage, that&apos;s $750 back to you. For hourly daytime rentals, the cleaning fee is waived or greatly reduced if everything is left clean. Check-in begins at 3:00 p.m. and check-out is 11:00 a.m. See <Link href="/pricing">pricing and policies</Link> for cancellation and house rules.</p>
          </div>
        </div>
      </section>

      <section className="sand" id="rental-details" style={{ scrollMarginTop: 80 }}>
        <div className="container narrow">
          <div className="eyebrow">Step 3</div>
          <h2>Your rental details</h2>
          <p className="lede">Already confirmed your date with us? Fill this out once and we&apos;ll put it straight into your rental agreement, then send it to you through SignNow to sign.</p>
          <p className="muted">Haven&apos;t picked a date yet? <Link href="/book">Start with step 1</Link>. Your date is not reserved until the agreement is signed and the payment due at signing is received.</p>
          <RentalForm />
        </div>
      </section>
    </>
  );
}
