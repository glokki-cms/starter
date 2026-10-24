import type { MetadataRoute } from "next"

/**
 * Keyed off APP_ENV like cmsMetadata(): only production is indexable.
 * /cdn/ and /og/ stay crawlable (image search, link previews).
 */
export default function robots(): MetadataRoute.Robots {
  if (process.env.APP_ENV !== "production") {
    return { rules: [{ userAgent: "*", disallow: "/" }] }
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
  }
}
