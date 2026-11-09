import Link from "next/link";
import { CtaBand, PageHero } from "@/components/Blocks";
import { JsonLd } from "@/components/JsonLd";
import { ATTRACTIONS, DRIVE_TIMES } from "@/lib/content";
import { crumbsSchema, meta } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = meta({
  title: "Things to Do near St. Anthony, Idaho",
  description: "A local's guide to the St. Anthony Sand Dunes, the Henry's Fork, Mesa Falls, Harriman State Park, Yellowstone day trips, and winter fun near The Burland.",
  path: "/area-attractions",
  image: "img-area-waterfall",
});

export default function Area() {
  return (
    <>
      <PageHero img="img-area-waterfall" eyebrow="The area" title="The best backyard in Eastern Idaho" lede="St. Anthony sits right in the middle of it all: sand dunes to the west, a famous trout river through town, and waterfalls and Yellowstone up the road." crumbs={[{ name: "The Area", href: "/area-attractions" }]} />
      <section>
        <div className="container">
          <div className="grid g2">
            {ATTRACTIONS.map((a) => (
              <Link key={a.slug} href={`/area/${a.slug}`} className="card tool-card">
                <span className="chip">{a.drive}</span>
                <h2 style={{ fontSize: "1.6rem", margin: "6px 0 4px" }}>{a.name}</h2>
                <p className="muted">{a.summary}</p>
                <p className="small" style={{ margin: 0 }}>Good for: {a.goodFor.join(", ")}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="sand">
        <div className="container grid g2" style={{ alignItems: "start" }}>
          <div>
            <div className="eyebrow">Getting around</div>
            <h2>Drive times from The Burland</h2>
            <p className="muted">Approximate, in good weather. Mountain passes take longer in winter.</p>
            <div className="table-wrap"><table><tbody>{DRIVE_TIMES.map((d) => <tr key={d.place}><td>{d.place}</td><td className="amt">{d.time}</td></tr>)}</tbody></table></div>
          </div>
          <div>
            <div className="eyebrow">Make it a plan</div>
            <h2>Build your family itinerary</h2>
            <p>Drag your favorite outings into a day-by-day plan, then print it or share it with the family.</p>
            <Link href="/plan/itinerary" className="btn btn-dark">Open the itinerary builder</Link>
          </div>
        </div>
      </section>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `Things to do near ${SITE.name}`,
          itemListElement: ATTRACTIONS.map((a, i) => ({ "@type": "ListItem", position: i + 1, name: a.name, url: `${SITE.url}/area/${a.slug}` })),
        }}
      />
      <JsonLd data={crumbsSchema([{ name: "The Area", path: "/area-attractions" }])} />
      <CtaBand title="Make The Burland your home base" text="Explore all day, then come home to one big family dinner." />
    </>
  );
}
