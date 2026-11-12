import Link from "next/link";
import { BookingPlanner } from "@/components/booking/BookingPlanner";
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
        <div className="section-head" style={{ marginBottom: 28 }}>
          <div className="eyebrow">Plan and book</div>
          <h1 style={{ fontSize: "clamp(2rem,4vw,3rem)" }}>Find your dates and see your price</h1>
          <p className="lede">Three quick steps. You&apos;ll see the full estimate and payment schedule before you send anything, and we confirm every request personally. Prefer to talk? Call or text <a href={`tel:${SITE.phone}`}>{SITE.phone}</a>.</p>
        </div>
        <BookingPlanner />
        <p className="small muted" style={{ marginTop: 24 }}>
          Already worked out your date with us? <Link href="/how-to-book#rental-details">Send your rental agreement details</Link>. New to booking with us? <Link href="/how-to-book">See how it works</Link>.
        </p>
      </div>
    </section>
  );
}
