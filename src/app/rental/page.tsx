import Link from "next/link";
import { RentalForm } from "@/components/RentalForm";
import { meta } from "@/lib/seo";

export const metadata = meta({
  title: "Rental Agreement Details",
  description: "Send your rental details once and we'll put them straight into your Burland rental agreement.",
  path: "/rental",
  noindex: true,
});

export default function Rental() {
  return (
    <section style={{ paddingTop: 140 }}>
      <div className="container narrow">
        <div className="eyebrow">Rental agreement</div>
        <h1 style={{ fontSize: "clamp(2.2rem,4.5vw,3.2rem)" }}>Your rental details</h1>
        <p className="lede">Fill this out once and we&apos;ll put it straight into your rental agreement, then send it to you through SignNow to sign.</p>
        <p className="muted">Still deciding on a date? <Link href="/book">Check dates and pricing</Link> first. Your date is not reserved until the agreement is signed and the payment due at signing is received.</p>
        <RentalForm />
      </div>
    </section>
  );
}
