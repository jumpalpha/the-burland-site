import Link from "next/link";
import { CtaBand, PageHero } from "@/components/Blocks";
import { Picture } from "@/components/Picture";
import { JsonLd } from "@/components/JsonLd";
import { crumbsSchema, meta } from "@/lib/seo";
import { RATES, fmtUSD } from "@/lib/site";

export const metadata = meta({
  title: "Retreats, Parties, and Group Getaways",
  description: "Church groups, youth retreats, milestone birthdays, and team getaways at The Burland in St. Anthony, Idaho. Sleeps 40+, hourly off-season rentals from $200 any day of the week.",
  path: "/retreats",
  image: "img-lounge-barn-doors",
});

const USES = [
  { t: "Church and youth retreats", d: "Sleep 40+ on site, worship or meet in the ballroom, and cook together in the full kitchen." },
  { t: "Milestone birthdays and anniversaries", d: "A 50th anniversary dinner under the chandeliers, with the whole family staying over." },
  { t: "Team and club getaways", d: "Lounges for breakout conversations, a media room for presentations or movie night, and the dunes for an afternoon outing." },
  { t: "Daytime gatherings", d: `Off-season, any day, by the hour: ${fmtUSD(RATES.hourly.first)} for the first hour, ${fmtUSD(RATES.hourly.additional)} for each hour after.` },
];

export default function Retreats() {
  return (
    <>
      <PageHero img="img-lounge-barn-doors" eyebrow="Retreats and gatherings" title="Room to get away, together" lede="Retreats, parties, and group getaways in a building that feels like home, just a lot bigger." crumbs={[{ name: "Retreats", href: "/retreats" }]}>
        <div className="row" style={{ marginTop: 24 }}><Link href="/book?type=Retreat" className="btn btn-brass">Check dates</Link></div>
      </PageHero>
      <section>
        <div className="container grid g2">
          {USES.map((u) => <div key={u.t} className="card"><h3>{u.t}</h3><p className="muted">{u.d}</p></div>)}
        </div>
      </section>
      <section className="sand">
        <div className="container split">
          <div>
            <h2>Winter weekdays are wide open</h2>
            <p>From October through April, weeknights start at {fmtUSD(RATES.off.weeknight)} for the whole building with no minimum stay. It&apos;s the best value of the year for groups that can travel midweek.</p>
            <Link href="/book?type=Retreat" className="btn btn-dark">See off-season dates</Link>
          </div>
          <div className="media"><Picture src="img-media-room" sizes="(max-width: 860px) 100vw, 50vw" /></div>
        </div>
      </section>
      <JsonLd data={crumbsSchema([{ name: "Retreats", path: "/retreats" }])} />
      <CtaBand />
    </>
  );
}
