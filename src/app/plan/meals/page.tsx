import Link from "next/link";
import { MealPlanner } from "@/components/tools/MealPlanner";
import { JsonLd } from "@/components/JsonLd";
import { crumbsSchema, meta } from "@/lib/seo";

export const metadata = meta({ title: "Reunion Meal Sign-Up Planner", description: "Assign reunion meals by household, track allergies, and print a sign-up sheet. Free tool from The Burland.", path: "/plan/meals" });

export default function Page() {
  return (
    <section style={{ paddingTop: 140 }}>
      <div className="container">
        <nav className="crumbs no-print" aria-label="Breadcrumb"><Link href="/">Home</Link> / <Link href="/plan">Planning tools</Link></nav>
        <div className="eyebrow">Reunion Meal Sign-Up Planner</div>
        <h1 style={{ fontSize: "clamp(2.1rem,4.2vw,3.1rem)" }}>Everybody cooks once</h1>
        <p className="lede" style={{ marginBottom: 32 }}>Give each household one meal so everyone relaxes the rest of the weekend. Rotate automatically, then print or share.</p>
        <MealPlanner />
      </div>
      <JsonLd data={crumbsSchema([{ name: "Planning tools", path: "/plan" }, { name: "Reunion Meal Sign-Up Planner", path: "/plan/meals" }])} />
    </section>
  );
}
