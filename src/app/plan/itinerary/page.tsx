import Link from "next/link";
import { Itinerary } from "@/components/tools/Itinerary";
import { JsonLd } from "@/components/JsonLd";
import { crumbsSchema, meta } from "@/lib/seo";

export const metadata = meta({ title: "Family Trip Itinerary Builder", description: "Plan your Eastern Idaho trip day by day: St. Anthony Sand Dunes, Mesa Falls, the Henry's Fork, Yellowstone and more. Free tool from The Burland.", path: "/plan/itinerary" });

export default function Page() {
  return (
    <section style={{ paddingTop: 140 }}>
      <div className="container">
        <nav className="crumbs no-print" aria-label="Breadcrumb"><Link href="/">Home</Link> / <Link href="/plan">Planning tools</Link></nav>
        <div className="eyebrow">Family Trip Itinerary Builder</div>
        <h1 style={{ fontSize: "clamp(2.1rem,4.2vw,3.1rem)" }}>Build your trip, day by day</h1>
        <p className="lede" style={{ marginBottom: 32 }}>Pick outings for each day of your stay, then print it or send it to the family.</p>
        <Itinerary />
      </div>
      <JsonLd data={crumbsSchema([{ name: "Planning tools", path: "/plan" }, { name: "Family Trip Itinerary Builder", path: "/plan/itinerary" }])} />
    </section>
  );
}
