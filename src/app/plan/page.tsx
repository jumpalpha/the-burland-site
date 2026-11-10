import Link from "next/link";
import { Icon, type IconName } from "@/components/Icon";
import { CtaBand } from "@/components/Blocks";
import { meta } from "@/lib/seo";

export const metadata = meta({
  title: "Free Reunion and Event Planning Tools",
  description: "Free tools for planning a family reunion or wedding weekend: instant price estimates, a cost splitter, an itinerary builder, a meal sign-up planner, and printable guides.",
  path: "/plan",
});

const TOOLS: { href: string; ico: IconName; t: string; d: string }[] = [
  { href: "/book", ico: "calendar", t: "Instant estimate and booking request", d: "See the price, minimum stay, and payment schedule for any dates." },
  { href: "/plan/cost-splitter", ico: "split", t: "Cost splitter", d: "Split the total by family or by person. Kids free, half, or full price." },
  { href: "/plan/itinerary", ico: "map", t: "Itinerary builder", d: "Plan each day around the dunes, the falls, and Yellowstone." },
  { href: "/plan/meals", ico: "meal", t: "Meal sign-up planner", d: "Assign meals by household and print the schedule." },
  { href: "/plan/packing", ico: "pack", t: "Packing checklist", d: "Everything to bring for the kitchen, the kids, and the memories." },
  { href: "/guides", ico: "list", t: "Printable planning guides", d: "Step-by-step reunion and wedding timelines." },
];

export default function Plan() {
  return (
    <>
      <section style={{ paddingTop: 140 }}>
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">Planning tools</div>
            <h1 style={{ fontSize: "clamp(2.2rem,4.5vw,3.4rem)" }}>Everything the family organizer needs</h1>
            <p className="lede">Free, no sign-up, and saved right on your device. Print anything or copy it into the family group chat.</p>
          </div>
          <div className="grid g3">
            {TOOLS.map((x) => (
              <Link key={x.href} href={x.href} className="card tool-card">
                <span className="ico"><Icon name={x.ico} /></span>
                <h2 style={{ fontSize: "1.3rem", margin: 0 }}>{x.t}</h2>
                <p className="muted small" style={{ margin: 0 }}>{x.d}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
