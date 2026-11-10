import { CtaBand, PageHero } from "@/components/Blocks";
import { Picture } from "@/components/Picture";
import { JsonLd } from "@/components/JsonLd";
import { crumbsSchema, meta } from "@/lib/seo";

export const metadata = meta({
  title: "Our Story: Restoring a 1912 Building in St. Anthony",
  description: "How a 1912 building in downtown St. Anthony, Idaho was rebuilt from the roof down into The Burland, a gathering place for families.",
  path: "/our-story",
  image: "img-restoration-facade",
});

const RESTORE = ["img-restoration-roof", "img-restoration-hall", "img-restoration-hall-balcony", "img-restoration-room"];

export default function Story() {
  return (
    <>
      <PageHero img="img-restoration-facade" eyebrow="Our story" title="A 1912 building, rebuilt for families" lede="Since 2020, this downtown St. Anthony building has been restored from the roof down with one purpose: bringing families together under one roof." crumbs={[{ name: "Our Story", href: "/our-story" }]} />
      <section>
        <div className="container narrow prose">
          <h2>A town with deep roots</h2>
          <p>St. Anthony got its start around 1890, when C.H. Moon settled at what locals called Moon Corner, near today&apos;s Main and Bridge Streets, and named the town after St. Anthony Falls in Minnesota. When Fremont County was created in 1893, St. Anthony became its county seat, and once the railroad arrived in 1899 the downtown filled with department stores, a stake tabernacle, and, by 1913, an opera house. The Fremont County Courthouse, finished in 1909, still stands and is on the National Register of Historic Places.</p>
          <p>The Burland building went up in 1912, right in the middle of that boom.</p>
          <h2>Bringing it back</h2>
          <p>The restoration began in 2020 and started at the very top, with the roof, then worked its way down. The photos below show the roof, the main hall and balcony, and the rooms mid-project. Today the building holds private family suites, a full kitchen, a game room, and a ballroom fit for a wedding.</p>
          <p>The goal never changed: create a place where grandparents, kids, and grandkids can all stay together, cook together, and stay up too late talking. Not a hotel. A family home, made bigger.</p>
        </div>
      </section>
      <section className="sand tight">
        <div className="container grid g4">
          {RESTORE.map((r) => <div key={r} className="media" style={{ aspectRatio: "3/4" }}><Picture src={r} sizes="(max-width: 620px) 100vw, 25vw" /></div>)}
        </div>
      </section>
      <JsonLd data={crumbsSchema([{ name: "Our Story", path: "/our-story" }])} />
      <CtaBand title="Come make some new history" text="Your family's story could be the next one these walls hold." img="img-ballroom-chandeliers" />
    </>
  );
}
