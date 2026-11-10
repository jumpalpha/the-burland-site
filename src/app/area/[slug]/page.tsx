import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand, PageHero } from "@/components/Blocks";
import { JsonLd } from "@/components/JsonLd";
import { ATTRACTIONS } from "@/lib/content";
import { crumbsSchema, meta } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const dynamicParams = false;
export const generateStaticParams = () => ATTRACTIONS.map((a) => ({ slug: a.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = ATTRACTIONS.find((x) => x.slug === slug);
  if (!a) return {};
  return meta({ title: `${a.name}: A Local's Guide`, description: `${a.summary} ${a.drive} from The Burland in St. Anthony, Idaho.`, path: `/area/${a.slug}`, image: a.img });
}

export default async function AttractionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = ATTRACTIONS.find((x) => x.slug === slug);
  if (!a) notFound();
  const others = ATTRACTIONS.filter((x) => x.slug !== a.slug).slice(0, 3);
  return (
    <>
      <PageHero img={a.img ?? "img-area-river"} eyebrow={`${a.drive} from The Burland`} title={a.name} lede={a.summary} crumbs={[{ name: "The Area", href: "/area-attractions" }, { name: a.short, href: `/area/${a.slug}` }]} />
      <section>
        <div className="container split" style={{ alignItems: "start" }}>
          <article className="prose">
            {a.body.map((p) => <p key={p.slice(0, 30)}>{p}</p>)}
            <h2>Local tips</h2>
            <ul className="check">{a.tips.map((t) => <li key={t}>{t}</li>)}</ul>
            <p className="sources" style={{ marginTop: 28 }}>
              Sources:{" "}
              {a.sources.map((s, i) => (
                <span key={s}>{i > 0 && " · "}<a href={s} rel="noopener nofollow">{new URL(s).hostname.replace("www.", "")}</a></span>
              ))}
              . Details change, so check before you go.
            </p>
          </article>
          <aside className="card">
            <h3>At a glance</h3>
            <dl style={{ margin: 0, display: "grid", gap: 12 }}>
              <div><dt className="small muted">From The Burland</dt><dd style={{ margin: 0 }}>{a.drive}</dd></div>
              <div><dt className="small muted">When to go</dt><dd style={{ margin: 0 }}>{a.season}</dd></div>
              <div><dt className="small muted">Good for</dt><dd style={{ margin: 0 }}>{a.goodFor.join(", ")}</dd></div>
            </dl>
            <Link href={`/plan/itinerary?add=${a.slug}`} className="btn btn-dark btn-sm" style={{ marginTop: 18 }}>Add to my itinerary</Link>
          </aside>
        </div>
      </section>
      <section className="sand tight">
        <div className="container">
          <h2>More nearby</h2>
          <div className="grid g3">
            {others.map((o) => (
              <Link key={o.slug} href={`/area/${o.slug}`} className="card tool-card"><span className="chip">{o.drive}</span><h3>{o.name}</h3><p className="small muted">{o.summary}</p></Link>
            ))}
          </div>
        </div>
      </section>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TouristAttraction",
          name: a.name,
          description: a.summary,
          url: `${SITE.url}/area/${a.slug}`,
          isAccessibleForFree: false,
          containedInPlace: { "@type": "AdministrativeArea", name: "Eastern Idaho" },
        }}
      />
      <JsonLd data={crumbsSchema([{ name: "The Area", path: "/area-attractions" }, { name: a.name, path: `/area/${a.slug}` }])} />
      <CtaBand title={`Stay close to ${a.short}`} text="The Burland sleeps 40+ under one roof in downtown St. Anthony." />
    </>
  );
}
