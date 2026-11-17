import Link from "next/link";
import { CtaBand, PageHero } from "@/components/Blocks";
import { Picture } from "@/components/Picture";
import { JsonLd } from "@/components/JsonLd";
import { Explorer, PlaceButton } from "@/components/basecamp/Explorer";
import { EPISODES, PLACES, PLANS, ROOMS } from "@/lib/basecamp";
import { crumbsSchema, meta } from "@/lib/seo";
import { SITE, asset } from "@/lib/site";

export const metadata = meta({
  title: "Burland Basecamp: Reunion Guide and Podcast for Eastern Idaho",
  description: "Your family reunion guide to everything within 150 miles of The Burland: Yellowstone, the Tetons, Henry's Fork, Craters of the Moon, and the local favorites in between. Plus the Burland Basecamp podcast.",
  path: "/basecamp",
  image: "img-area-river",
});

const short = (id: string) => (PLACES.find((p) => p.id === id)?.name ?? id).split(" (")[0].split(":")[0];

export default function Basecamp() {
  return (
    <>
      <PageHero
        img="img-area-river"
        eyebrow="Burland Basecamp"
        title="Your reunion basecamp for Eastern Idaho"
        lede="Everything within 150 miles of The Burland, from Yellowstone and the Tetons to the sand dunes down the road. Plus a podcast with ideas for making the most of your stay."
        crumbs={[{ name: "Basecamp", href: "/basecamp" }]}
      >
        <div className="row" style={{ marginTop: 22 }}>
          <a href="#podcast" className="btn btn-ghost btn-sm">Podcast</a>
          <a href="#rooms" className="btn btn-ghost btn-sm">The Burland</a>
          <a href="#explore" className="btn btn-ghost btn-sm">Explore the map</a>
          <a href="#plans" className="btn btn-ghost btn-sm">Reunion plans</a>
        </div>
      </PageHero>

      <section id="podcast">
        <div className="container">
          <div className="bc-show">
            <div className="bc-cover" aria-hidden="true">
              <Picture src="img-area-river" sizes="220px" />
              <div>
                <small>The Burland presents</small>
                <strong>Burland Basecamp</strong>
              </div>
            </div>
            <div>
              <div className="eyebrow">The podcast</div>
              <h2>Ideas for your reunion, one episode at a time</h2>
              <p className="lede">Short conversations about how to spend your days here: where to take the grandkids, which day trips are worth it, and what to do when it rains.</p>
              <span className="chip">New episodes every other week</span>
            </div>
          </div>
          <div className="bc-episodes">
            {EPISODES.map((ep) => (
              <article key={ep.n} className="bc-ep">
                <div className="bc-ep-n">{String(ep.n).padStart(2, "0")}</div>
                <div>
                  <h3>{ep.title}</h3>
                  {(ep.date || ep.length) && <div className="small muted">{[ep.date, ep.length].filter(Boolean).join(" · ")}</div>}
                  <p>{ep.blurb}</p>
                  {ep.status === "live" && ep.audio ? (
                    <audio controls preload="metadata" src={asset(ep.audio)} style={{ width: "100%", maxWidth: 560 }} />
                  ) : (
                    <span className="chip bc-soon">Coming soon</span>
                  )}
                  {ep.links.length > 0 && (
                    <div className="row" style={{ gap: 8, marginTop: 12 }}>
                      {ep.links.map((id) => <PlaceButton key={id} id={id} label={short(id)} />)}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
          <p className="small muted" style={{ marginTop: 18 }}>Episodes are audio overviews based on our area guide. Always check park and road conditions before you go.</p>
        </div>
      </section>

      <section id="rooms" className="sand">
        <div className="container">
          <div className="split">
            <div>
              <div className="eyebrow">The Burland</div>
              <h2>A 1912 building, rebuilt for families</h2>
              <p>The Burland was built in 1912 in downtown St. Anthony. Since 2020 it has been restored from the roof down, with new wood floors, new ceilings, and the original character kept wherever it could be saved.</p>
              <p>{SITE.squareFeet} square feet across {SITE.floors} floors, sleeping {SITE.sleeps} under one roof. Rent the whole building or the spaces you need.</p>
              <div className="row">
                <Link href="/our-story" className="btn btn-dark">Read our story</Link>
                <Link href="/gallery" className="btn btn-line">See the gallery</Link>
              </div>
            </div>
            <div className="media" style={{ aspectRatio: "4/5" }}>
              <Picture src="img-restoration-facade" sizes="(max-width: 860px) 100vw, 45vw" />
            </div>
          </div>
          <h3 style={{ marginTop: 56 }}>The rooms</h3>
          <div className="grid g4 bc-rooms">
            {ROOMS.map((r) => (
              <div key={r.name} className="card bc-room">
                {r.img ? <div className="media" style={{ aspectRatio: "4/3", boxShadow: "none" }}><Picture src={r.img} sizes="(max-width: 620px) 100vw, 25vw" /></div> : <div className="bc-ph">{r.name}</div>}
                <h4>{r.name}</h4>
                <p className="small muted">{r.text ?? "Details coming soon."}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="explore">
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">Explore</div>
            <h2>Everything within 150 miles</h2>
            <p className="lede">Tap a category to narrow it down. Local favorites are the places out-of-towners tend to miss.</p>
          </div>
          <Explorer />
        </div>
      </section>

      <section id="plans" className="sand">
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">Ready-made plans</div>
            <h2>Three easy reunion days</h2>
            <p className="lede">Mix and match these with days at The Burland for games, meals, and time together.</p>
          </div>
          <div className="grid g3">
            {PLANS.map((p) => (
              <div key={p.title} className="card">
                <div className="eyebrow" style={{ marginBottom: 8 }}>{p.kicker}</div>
                <h3>{p.title}</h3>
                <ol className="bc-steps">
                  {p.steps.map(([when, what]) => (
                    <li key={when}><b>{when}</b> {what}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 24 }}>
            <Link href="/plan/itinerary">Build your own day-by-day plan</Link> or browse the <Link href="/area-attractions">area guide</Link>.
          </p>
        </div>
      </section>

      <JsonLd data={crumbsSchema([{ name: "Basecamp", path: "/basecamp" }])} />
      <CtaBand title="Make The Burland your basecamp" text="One roof for the whole family, with all of this within a day's drive." />
    </>
  );
}
