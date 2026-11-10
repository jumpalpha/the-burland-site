import Link from "next/link";
import { CtaBand, Faq, PageHero } from "@/components/Blocks";
import { Picture } from "@/components/Picture";
import { JsonLd } from "@/components/JsonLd";
import { FAQS, REVIEWS, SAMPLE_WEEKEND } from "@/lib/content";
import { crumbsSchema, faqSchema, meta } from "@/lib/seo";

export const metadata = meta({
  title: "Family Reunion Venue in Eastern Idaho",
  description: "Host your family reunion at The Burland in St. Anthony, Idaho. Sleeps 40+ under one roof with a full kitchen, ballroom, and kids' game room, minutes from the sand dunes.",
  path: "/reunions",
  image: "img-ballroom-dinner-setup",
});

const FEATURES = [
  { t: "Sleeps 40+", d: "On-site sleeping for the whole family. No hotel blocks, no splitting up across town." },
  { t: "10,000 sq ft", d: "Three floors with a ballroom, a game room, lounges, and private living spaces." },
  { t: "Full kitchen", d: "Bring the family recipes. The kitchen is set up for cooking for a crowd." },
  { t: "Kids' game room", d: "Ping-pong, air hockey, and an arcade corner keep the cousins busy while the grown-ups catch up." },
  { t: "Ballroom dinners", d: "Long tables under the chandeliers for the big Saturday dinner and the group photo." },
  { t: "Endless day trips", d: "Sand dunes, the Henry's Fork, Mesa Falls, and Yellowstone are all an easy drive." },
];

const COMPARE = [
  ["Everyone under one roof", "Yes", "Rarely", "No"],
  ["Big group gathering space", "Yes", "No", "No"],
  ["Sleeps 40+ on site", "Yes", "No", "Yes"],
  ["Full kitchen for the group", "Yes", "Yes", "No"],
  ["Dedicated kids' game room", "Yes", "No", "No"],
];

const reunionFaqs = FAQS.filter((f) => ["How many people can stay overnight?", "How far ahead should we book?", "Can we cook our own food?", "Is it good for grandparents and little kids?", "What does it cost?", "Can we tour The Burland first?"].includes(f.q));

export default function Reunions() {
  return (
    <>
      <PageHero img="img-ballroom-dinner-setup" eyebrow="Family reunions" title="Everyone under one roof, finally" lede="Room for the whole family tree, from the littlest grandkids to the great-grandparents, in a restored 1912 building in downtown St. Anthony." short={false} crumbs={[{ name: "Reunions", href: "/reunions" }]}>
        <div className="row" style={{ marginTop: 24 }}>
          <Link href="/book?type=Family%20reunion" className="btn btn-brass">Check dates and price</Link>
          <Link href="/plan" className="btn btn-ghost">Free reunion planning tools</Link>
        </div>
      </PageHero>

      <section>
        <div className="container">
          <div className="section-head"><div className="eyebrow">Why families come back</div><h2>Built for big families</h2></div>
          <div className="grid g3">
            {FEATURES.map((f, i) => (
              <div key={f.t} className="card"><div className="num">0{i + 1}</div><h3>{f.t}</h3><p className="muted">{f.d}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="dark">
        <div className="container split">
          <div>
            <div className="eyebrow">A sample weekend</div>
            <h2>What a Burland reunion looks like</h2>
            <div className="timeline" style={{ marginTop: 24 }}>
              {SAMPLE_WEEKEND.map((s) => (
                <div key={s.when} className="step"><div className="when">{s.when}</div><div><h3 style={{ marginBottom: 4 }}>{s.title}</h3><p className="muted" style={{ margin: 0 }}>{s.text}</p></div></div>
              ))}
            </div>
          </div>
          <div className="media" style={{ aspectRatio: "4/5" }}><Picture src="img-game-room-pingpong" sizes="(max-width: 860px) 100vw, 50vw" /></div>
        </div>
      </section>

      <section>
        <div className="container split flip">
          <div>
            <div className="eyebrow">Local tip</div>
            <h2>Plan around Pioneer Days</h2>
            <p>Every year in late July, around July 24, St. Anthony hosts Fremont County Pioneer Days with a parade looping through downtown and a rodeo at the county fairgrounds. Local families have planned reunions around it for generations.</p>
            <p className="muted">Those weekends book early. If you want Pioneer Days, reach out 6 to 12 months ahead.</p>
            <Link href="/book?type=Family%20reunion" className="btn btn-dark">Check July dates</Link>
          </div>
          <div className="media"><Picture src="img-restoration-facade" sizes="(max-width: 860px) 100vw, 50vw" /></div>
        </div>
      </section>

      <section className="sand">
        <div className="container">
          <div className="section-head center"><h2>The Burland vs. the usual options</h2></div>
          <div className="table-wrap narrow" style={{ margin: "0 auto" }}>
            <table>
              <thead><tr><th></th><th>The Burland</th><th>Vacation rentals</th><th>Hotel block</th></tr></thead>
              <tbody>{COMPARE.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i} style={i === 1 ? { fontWeight: 700, color: "var(--ok)" } : undefined}>{c}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-head"><div className="eyebrow">Planning made easy</div><h2>Free tools for the family organizer</h2></div>
          <div className="grid g3">
            <Link href="/plan/cost-splitter" className="card tool-card"><h3>Cost splitter</h3><p className="muted small">Split the total by family or by head, with a discount for kids.</p></Link>
            <Link href="/plan/meals" className="card tool-card"><h3>Meal sign-up</h3><p className="muted small">Give each family one meal and print the schedule.</p></Link>
            <Link href="/guide-reunion" className="card tool-card"><h3>Reunion planning guide</h3><p className="muted small">A 9 to 12 month checklist from date to goodbyes.</p></Link>
          </div>
        </div>
      </section>

      <section className="sand">
        <div className="container grid g3">
          {REVIEWS.map((r) => (
            <figure key={r.who} className="card" style={{ margin: 0 }}>
              <div style={{ color: "var(--brass)" }} aria-label="5 out of 5 stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
              <blockquote style={{ margin: "12px 0" }}>{r.text}</blockquote>
              <figcaption className="small muted">{r.who}, Google review summary</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section>
        <div className="container narrow"><div className="section-head center"><h2>Reunion questions</h2></div><Faq items={reunionFaqs} /></div>
      </section>
      <JsonLd data={faqSchema(reunionFaqs)} />
      <JsonLd data={crumbsSchema([{ name: "Reunions", path: "/reunions" }])} />
      <CtaBand title="Summer weekends go first" text="Lock in your reunion date before the family group chat finishes voting." img="img-ballroom-chandeliers" />
    </>
  );
}
