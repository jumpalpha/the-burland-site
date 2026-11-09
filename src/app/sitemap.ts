import type { MetadataRoute } from "next";
import { ATTRACTIONS } from "@/lib/content";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

const PAGES: [string, number][] = [
  ["/", 1],
  ["/reunions", 0.9],
  ["/weddings", 0.9],
  ["/book", 0.9],
  ["/pricing", 0.8],
  ["/availability", 0.8],
  ["/retreats", 0.7],
  ["/gallery", 0.7],
  ["/area-attractions", 0.7],
  ["/our-story", 0.6],
  ["/faq", 0.6],
  ["/contact", 0.6],
  ["/plan", 0.6],
  ["/plan/cost-splitter", 0.5],
  ["/plan/itinerary", 0.5],
  ["/plan/meals", 0.5],
  ["/plan/packing", 0.4],
  ["/guides", 0.5],
  ["/guide-reunion", 0.5],
  ["/guide-wedding", 0.5],
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [...PAGES, ...ATTRACTIONS.map((a) => [`/area/${a.slug}`, 0.6] as [string, number])].map(([p, priority]) => ({
    url: SITE.url + p + (p.endsWith("/") ? "" : "/"),
    lastModified: now,
    priority,
  }));
}
