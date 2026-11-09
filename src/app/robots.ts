import type { MetadataRoute } from "next";
import { IS_PREVIEW, SITE } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  if (IS_PREVIEW) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/owner", "/rental", "/rental-review.html", "/voice-assistant-test", "/dopp-week/"] },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
