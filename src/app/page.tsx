import Link from "next/link";
import { Picture } from "@/components/Picture";
import { QuickBar } from "@/components/QuickBar";
import { CtaBand, Faq } from "@/components/Blocks";
import { JsonLd } from "@/components/JsonLd";
import { Icon, type IconName } from "@/components/Icon";
import { ATTRACTIONS, BOOKING_STEPS, FAQS, REVIEWS, TOWN_FACTS } from "@/lib/content";
import { faqSchema, meta } from "@/lib/seo";
import { RATES } from "@/lib/site";

export const metadata = meta({
  title: "The Burland | Family Reunion and Wedding Venue in St. Anthony, Idaho",
  description: "A restored 1912 building in downtown St. Anthony, Idaho that sleeps 40+. Family reunions, weddings, and retreats under one roof, minutes from the sand dunes and an easy drive to Yellowstone.",
  path: "/",
});

const SPACES = [
  { img: "img-ballroom-chandeliers", title: "The ballroom", text: "Chandeliers, long tables, and a dance floor for the big dinner." },
  { img: "img-suite-bedroom", title: "Family suites", text: "Private living spaces so every household has a door to close." },
  { img: "img-kitchen-island", title: "The kitchen", text: "A full kitchen built for feeding a crowd, with room to cook together." },
  { img: "img-game-room", title: "The game room", text: "Ping-pong, air hockey, and an arcade corner for the kids." },
];

const homeFaqs = FAQS.filter((f) => ["How does booking work?", "What does it cost?", "How many people can stay overnight?", "Can we cook our own food?", "How far is Yellowstone?"].includes(f.q));

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="bg"><Picture src="img-ballroom-chandeliers" alt="" priority /></div>
        <div className="container">
          <div className="eyebrow">St. Anthony, Idaho &middot; Since 1912</div>
          <h1>Where the whole family fits under one roof</h1>
          <p className="lede">A lovingly restored downtown building with room for 40+ to sleep, a ballroom for the big dinner, and a kitchen big enough for Grandma&apos;s recipes. Not a hotel. A family home, made bigger.</p>
          <QuickBar />
        </div>
      </section>

      <section>
        <div className="container split">
          <div>
            <div className="eyebrow">Welcome to The Burland</div>
            <h2>Built for the kind of weekend people talk about for years</h2>
            <p className="lede">Reunions usually mean a hotel block across town, a rented pavilion, and everyone driving back and forth. Here, the grandkids run the halls, the cousins stay up late in the game room, and breakfast happens in one kitchen.</p>
            <p>With over 10,000 square feet across three floors, there&apos;s space to be together and space to rest. Bring the whole family tree.</p>
            <div className="row" style={{ marginTop: 24 }}>
              <Link href="/reunions" className="btn btn-dark">Plan a reunion</Link>
              <Link href="/gallery" className="btn btn-line">Look inside</Link>
            </div>
          </div>
          <div className="stack">
            <div className="media"><Picture src="img-lounge-upper" sizes="(max-width: 860px) 100vw, 50vw" /></div>
            <div className="media"><Picture src="img-coffee-bar" sizes="25vw" /></div>
          </div>
        </div>
      </section>

      <section className="sand">
        <div className="container">
          <div className="section-head center">
            <div className="eyebrow">How booking works</div>
            <h2>Five simple steps, and a real person at every one</h2>
            <p className="lede">Nothing is booked automatically. You&apos;ll know the price and payment schedule before you sign anything.</p>
          </div>
          <ol className="howto-strip">
            {BOOKING_STEPS.map((s, i) => (
              <li key={s.t}>
                <span className="howto-num" aria-hidden="true">{i + 1}</span>
                <h3>{s.t}</h3>
                <p>{s.short}</p>
              </li>
            ))}
          </ol>
          <div className="row" style={{ marginTop: 28, justifyContent: "center" }}>
            <Link href="/book" className="btn btn-dark">Start with your dates</Link>
            <Link href="/how-to-book" className="btn btn-line">See the full steps</Link>
            <Link href="/how-to-book#rental-details" className="btn btn-line">Date confirmed? Fill out your details</Link>
          </div>
        </div>
      </section>

      <section className="dark tight">
        <div className="container grid g4 center">
          <div><div className="stat">40+</div><p className="muted">guests sleep on site</p></div>
          <div><div className="stat">10,000</div><p className="muted">square feet, three floors</p></div>
          <div><div className="stat">~15 min</div><p className="muted">to the sand dunes and Rexburg</p></div>
          <div><div className="stat">${RATES.off.weeknight}</div><p className="muted">off-season weeknights, the whole building</p></div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">The spaces</div>
            <h2>Room for every generation</h2>
            <p className="lede">Gather in the ballroom, cook together in the kitchen, and send the kids off to the game room while the grown-ups catch up.</p>
          </div>
          <div className="grid g4">
            {SPACES.map((s) => (
              <Link key={s.img} href="/gallery" className="photo-card">
                <Picture src={s.img} sizes="(max-width: 620px) 100vw, 25vw" />
                <div className="cap"><h3>{s.title}</h3><p>{s.text}</p></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="sand">
        <div className="container split flip">
          <div>
            <div className="eyebrow">Weddings</div>
            <h2>A wedding that feels like family, not a convention hall</h2>
            <p>Ceremony and reception in one place, a bridal suite and groom&apos;s lounge for getting ready, and room for out-of-town family to stay the night. Both Rexburg temples are about 15 minutes away, so the celebration can start the moment you arrive.</p>
            <p className="muted">Seats up to about 100 guests. Decor packages from $200.</p>
            <Link href="/weddings" className="btn btn-dark">Explore weddings</Link>
          </div>
          <div className="media"><Picture src="img-ballroom-tables" sizes="(max-width: 860px) 100vw, 50vw" /></div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-head center">
            <div className="eyebrow">Your planning toolkit</div>
            <h2>Plan the whole thing right here</h2>
            <p className="lede">Free tools that take the spreadsheet stress out of a big family trip.</p>
          </div>
          <div className="grid g4">
            {[
              { href: "/book", ico: "calendar", t: "Instant estimate", d: "Pick dates, see the price and payment schedule, and send a request in minutes." },
              { href: "/plan/cost-splitter", ico: "split", t: "Cost splitter", d: "Split the stay fairly by family or by head, with a kids discount." },
              { href: "/plan/itinerary", ico: "map", t: "Itinerary builder", d: "Line up the dunes, falls, and Yellowstone day by day." },
              { href: "/plan/meals", ico: "meal", t: "Meal planner", d: "Assign meals by family and print a sign-up sheet." },
            ].map((x) => (
              <Link key={x.href} href={x.href} className="card tool-card">
                <span className="ico"><Icon name={x.ico as IconName} /></span>
                <h3>{x.t}</h3>
                <p className="muted small">{x.d}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="dark">
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">Right outside the door</div>
            <h2>Eastern Idaho is the best backyard around</h2>
            <p className="lede">Sand dunes 15 minutes west, a world-famous trout river through town, waterfalls up the road, and Yellowstone a little over an hour north.</p>
          </div>
          <div className="grid g3">
            {ATTRACTIONS.slice(0, 3).map((a) => (
              <Link key={a.slug} href={`/area/${a.slug}`} className="card tool-card">
                <span className="chip">{a.drive}</span>
                <h3>{a.name}</h3>
                <p className="small">{a.summary}</p>
              </Link>
            ))}
          </div>
          <p style={{ marginTop: 28 }}><Link href="/area-attractions">See everything nearby &rarr;</Link></p>
        </div>
      </section>

      <section>
        <div className="container split">
          <div>
            <div className="eyebrow">A little history</div>
            <h2>A downtown building with a long memory</h2>
            <p>St. Anthony grew up on the banks of the Henry&apos;s Fork, and its downtown boomed after the railroad arrived in 1899. Since 2020, this 1912 building has been rebuilt from the roof down so families can make new memories in it.</p>
            <dl className="grid" style={{ gap: 14, margin: "24px 0" }}>
              {TOWN_FACTS.map((f) => (
                <div key={f.k} style={{ display: "grid", gridTemplateColumns: "72px 1fr", gap: 12 }}>
                  <dt className="num" style={{ fontSize: "1.2rem" }}>{f.k}</dt>
                  <dd style={{ margin: 0 }} className="muted">{f.v}</dd>
                </div>
              ))}
            </dl>
            <Link href="/our-story" className="btn btn-line">Read our story</Link>
          </div>
          <div className="media"><Picture src="img-restoration-hall-balcony" sizes="(max-width: 860px) 100vw, 50vw" /></div>
        </div>
      </section>

      <section className="sand">
        <div className="container">
          <div className="section-head center"><div className="eyebrow">Guest reviews</div><h2>What families tell us</h2></div>
          <div className="grid g3">
            {REVIEWS.map((r) => (
              <figure key={r.who} className="card" style={{ margin: 0 }}>
                <div style={{ color: "var(--brass)", letterSpacing: 2 }} aria-label="5 out of 5 stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
                <blockquote style={{ margin: "12px 0" }}>{r.text}</blockquote>
                <figcaption className="small muted">{r.who}, Google review summary</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="container narrow">
          <div className="section-head center"><div className="eyebrow">Good to know</div><h2>Quick answers</h2></div>
          <Faq items={homeFaqs} />
          <p className="center" style={{ marginTop: 28 }}><Link href="/faq">All questions &rarr;</Link></p>
        </div>
      </section>
      <JsonLd data={faqSchema(homeFaqs)} />
      <CtaBand />
    </>
  );
}
