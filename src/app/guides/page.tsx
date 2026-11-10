import { GuideForm } from "@/components/GuideForm";
import { meta } from "@/lib/seo";

export const metadata = meta({ title: "Free Reunion and Wedding Planning Guides", description: "Free printable planning guides for family reunions and weddings, with checklists, timelines, and ideas from The Burland.", path: "/guides", image: "img-ballroom-dinner-setup" });

export default function Guides() {
  return (
    <section style={{ paddingTop: 140 }}>
      <div className="container split" style={{ alignItems: "start" }}>
        <div>
          <div className="eyebrow">Free planning guides</div>
          <h1 style={{ fontSize: "clamp(2.2rem,4.5vw,3.2rem)" }}>Plan an event your family will never forget</h1>
          <p className="lede">Practical checklists, timelines, and ideas for your reunion or wedding. Print them or save them as a PDF.</p>
        </div>
        <GuideForm />
      </div>
    </section>
  );
}
