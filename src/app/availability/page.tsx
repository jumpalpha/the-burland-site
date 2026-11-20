import Link from "next/link";
import { PageHero } from "@/components/Blocks";
import { JsonLd } from "@/components/JsonLd";
import { crumbsSchema, meta } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { AvailabilityCalendar } from "@/components/booking/AvailabilityCalendar";

export const metadata = meta({
  title: "Availability Calendar",
  description: "See open dates at The Burland in St. Anthony, Idaho. Every date is confirmed personally by our team. Request your dates online in minutes.",
  path: "/availability",
  image: "img-ballroom-wide",
});

export default function Availability() {
  return (
    <>
      <PageHero img="img-ballroom-wide" eyebrow="Availability" title="Check open dates" lede="This calendar shows real availability. Dates are added and confirmed by our team, never automatically." crumbs={[{ name: "Availability", href: "/availability" }]} />
      <section className="tight">
        <div className="container">
          <div className="grid g3" style={{ marginBottom: 28 }}>
            <div className="card"><h3>Open unless marked</h3><p className="muted small">Every date is open unless the calendar marks it Booked.</p></div>
            <div className="card"><h3>Holiday rates</h3><p className="muted small">Dates marked Holiday are open at holiday rates.</p></div>
            <div className="card"><h3>Hold a date</h3><p className="muted small">Send a request through the planner or call or text {SITE.phone}. We&apos;ll confirm and add it ourselves.</p></div>
          </div>
          <div className="panel" style={{ padding: 8 }}>
            <AvailabilityCalendar />
          </div>
          <div className="row" style={{ marginTop: 28, justifyContent: "center" }}>
            <Link href="/book" className="btn btn-brass">Request my dates</Link>
            <a href={`tel:${SITE.phone}`} className="btn btn-line">Call or text {SITE.phone}</a>
          </div>
        </div>
      </section>
      <JsonLd data={crumbsSchema([{ name: "Availability", path: "/availability" }])} />
    </>
  );
}
