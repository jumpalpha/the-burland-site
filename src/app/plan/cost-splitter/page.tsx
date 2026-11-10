import Link from "next/link";
import { CostSplitter } from "@/components/tools/CostSplitter";
import { JsonLd } from "@/components/JsonLd";
import { crumbsSchema, meta } from "@/lib/seo";

export const metadata = meta({ title: "Reunion Cost Splitter", description: "Split a family reunion's cost fairly by household or by person, with discounts for kids and fewer nights. Free tool from The Burland.", path: "/plan/cost-splitter" });

export default function Page() {
  return (
    <section style={{ paddingTop: 140 }}>
      <div className="container">
        <nav className="crumbs no-print" aria-label="Breadcrumb"><Link href="/">Home</Link> / <Link href="/plan">Planning tools</Link></nav>
        <div className="eyebrow">Reunion Cost Splitter</div>
        <h1 style={{ fontSize: "clamp(2.1rem,4.2vw,3.1rem)" }}>Split the cost, keep the peace</h1>
        <p className="lede" style={{ marginBottom: 32 }}>Enter the total and each household. Kids can stay free or pay half, and families who stay fewer nights pay less.</p>
        <CostSplitter />
      </div>
      <JsonLd data={crumbsSchema([{ name: "Planning tools", path: "/plan" }, { name: "Reunion Cost Splitter", path: "/plan/cost-splitter" }])} />
    </section>
  );
}
