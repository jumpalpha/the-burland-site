import type { Metadata } from "next";
import { SITE, IS_PREVIEW } from "./site";
import { FAQS } from "./content";

export function meta(o: { title: string; description: string; path: string; image?: string; noindex?: boolean }): Metadata {
  const url = SITE.url + o.path + (o.path.endsWith("/") ? "" : "/");
  const image = `${SITE.url}/${o.image ?? "img-ballroom-chandeliers"}.jpg`;
  return {
    title: o.title,
    description: o.description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title: o.title, description: o.description, siteName: SITE.name, images: [{ url: image }], locale: "en_US" },
    twitter: { card: "summary_large_image", title: o.title, description: o.description, images: [image] },
    robots: IS_PREVIEW || o.noindex ? { index: false, follow: false } : { index: true, follow: true },
  };
}

export const venueSchema = () => ({
  "@context": "https://schema.org",
  "@type": ["EventVenue", "LodgingBusiness"],
  "@id": SITE.url + "/#venue",
  name: SITE.name,
  url: SITE.url + "/",
  description: SITE.description,
  telephone: "+1-208-709-1403",
  email: SITE.email,
  image: [`${SITE.url}/img-ballroom-chandeliers.jpg`, `${SITE.url}/img-lounge-upper.jpg`, `${SITE.url}/img-suite-bedroom.jpg`],
  address: { "@type": "PostalAddress", addressLocality: SITE.city, addressRegion: SITE.region, addressCountry: "US" },
  areaServed: ["St. Anthony", "Rexburg", "Idaho Falls", "Upper Snake River Valley", "Eastern Idaho"],
  foundingDate: String(SITE.founded),
  maximumAttendeeCapacity: SITE.maxInBuilding,
  checkinTime: "15:00",
  checkoutTime: "11:00",
  priceRange: "$800 to $1,500 per night",
  amenityFeature: ["Full kitchen", "Ballroom", "Game room", "Sleeps 40+", "Bridal suite", "Wi-Fi", "ADA accessible", "Sound system"].map((name) => ({ "@type": "LocationFeatureSpecification", name, value: true })),
  sameAs: Object.values(SITE.social),
});

export const faqSchema = (items = FAQS) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
});

export const crumbsSchema = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [{ name: "Home", path: "/" }, ...items].map((x, i) => ({ "@type": "ListItem", position: i + 1, name: x.name, item: SITE.url + x.path + (x.path.endsWith("/") ? "" : "/") })),
});
