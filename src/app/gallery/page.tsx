import { CtaBand, PageHero } from "@/components/Blocks";
import { Gallery } from "@/components/Gallery";
import { JsonLd } from "@/components/JsonLd";
import { PHOTOS } from "@/lib/content";
import { crumbsSchema, meta } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = meta({
  title: "Photo Gallery",
  description: "Look inside The Burland in St. Anthony, Idaho: the ballroom, family suites, full kitchen, game room, and the restoration of a 1912 downtown building.",
  path: "/gallery",
  image: "img-ballroom-wide",
});

export default function GalleryPage() {
  return (
    <>
      <PageHero img="img-lounge-upper" eyebrow="Photo gallery" title="Take a look inside" lede="The ballroom, the family suites, the game room, and the restoration that brought a 1912 building back to life." crumbs={[{ name: "Gallery", href: "/gallery" }]} />
      <section className="tight">
        <div className="container"><Gallery /></div>
      </section>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ImageGallery",
          name: "The Burland photo gallery",
          image: PHOTOS.filter((p) => p.group !== "Area").map((p) => ({ "@type": "ImageObject", contentUrl: `${SITE.url}/${p.src}.jpg`, caption: p.alt })),
        }}
      />
      <JsonLd data={crumbsSchema([{ name: "Gallery", path: "/gallery" }])} />
      <CtaBand title="Like what you see?" text="Come see it in person, or pick your dates and get an instant estimate." />
    </>
  );
}
