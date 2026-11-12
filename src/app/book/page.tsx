import Link from "next/link";
import { BookingPlanner } from "@/components/booking/BookingPlanner";
import { BOOKING_STEPS } from "@/lib/content";
import { meta } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = meta({
  title: "Plan and Book Your Stay",
  description: "Pick your dates at The Burland in St. Anthony, Idaho and see an instant price, minimum-stay rules, and payment schedule. Send a booking request in minutes.",
  path: "/book",
});

export default function BookPage() {
  return (
    <section style={{ paddingTop: 128 }}>
      <div className="container">
        <p className="small muted" style={{ margin: "0 0 8px" }}>Booking from start to finish. <Link href="/how-to-book">How it works</Link></p>
        <ol className="steps-mini" aria-label="Booking steps">
          {BOOKING_STEPS.map((s, i) => (
            <li key={s.t} className={i === 0 ? "now" : undefined} aria-current={i === 0 ? "step" : undefined}>
              <b>{i + 1}</b>
              <span>{i === 0 ? `Step 1 of 5: ${s.t}` : s.t}</span>
            </li>
          ))}
        </ol>
        <div className="skip-note">
          <p><strong>Already confirmed your date with us?</strong> Skip ahead to step 3 and send your rental details.</p>
          <Link href="/how-to-book#rental-details" className="btn btn-line btn-sm">Go to step 3</Link>
        </div>
        <div className="section-head" style={{ marginBottom: 28 }}>
          <div className="eyebrow">Plan and book</div>
          <h1 style={{ fontSize: "clamp(2rem,4vw,3rem)" }}>Find your dates and see your price</h1>
          <p className="lede">You&apos;ll see the full estimate and payment schedule before you send anything, and we confirm every request personally. Prefer to talk? Call or text <a href={`tel:${SITE.phone}`}>{SITE.phone}</a>.</p>
        </div>
        <BookingPlanner />
        <p className="small muted" style={{ marginTop: 24 }}>
          Want to know what happens after you send a request? <Link href="/how-to-book">See how booking works</Link>.
        </p>
      </div>
    </section>
  );
}
