import Link from "next/link";
import { Packing } from "@/components/tools/Packing";
import { JsonLd } from "@/components/JsonLd";
import { crumbsSchema, meta } from "@/lib/seo";

export const metadata = meta({ title: "Reunion Packing Checklist", description: "A printable packing checklist for a family reunion or getaway at The Burland in St. Anthony, Idaho.", path: "/plan/packing" });

export default function Page() {
  return (
    <section style={{ paddingTop: 140 }}>
      <div className="container">
        <nav className="crumbs no-print" aria-label="Breadcrumb"><Link href="/">Home</Link> / <Link href="/plan">Planning tools</Link></nav>
        <div className="eyebrow">Reunion Packing Checklist</div>
        <h1 style={{ fontSize: "clamp(2.1rem,4.2vw,3.1rem)" }}>What to bring</h1>
        <p className="lede" style={{ marginBottom: 32 }}>A checklist for the kitchen, the kids, the memories, and winter trips.</p>
        <Packing />
      </div>
      <JsonLd data={crumbsSchema([{ name: "Planning tools", path: "/plan" }, { name: "Reunion Packing Checklist", path: "/plan/packing" }])} />
    </section>
  );
}
