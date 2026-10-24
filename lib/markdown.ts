import type { DeliveryPage } from "@glokki-cms/sdk"

import { defaultLocale, type ResolvedRoute, resolveRoute } from "./i18n"

/**
 * Wiring for the agent-facing Markdown route (app/md/[[...slug]]/route.ts,
 * see docs/guides/markdown-for-agents.md).
 *
 * The SDK's default resolver knows nothing about locale prefixes, so this
 * app maps the request through the same `resolveRoute()` the HTML pages use:
 *
 *   /about.md     → /md/about     → locale=default, slug="/about"
 *   /pl/o-nas.md  → /md/pl/o-nas  → locale=pl,      slug="/o-nas"
 *   /index.md     → /md/index     → locale=default, slug="/"
 *   /pl/index.md  → /md/pl/index  → locale=pl,      slug="/"
 */
export function resolveMarkdownRequest(request: Request): ResolvedRoute {
  const { pathname } = new URL(request.url)
  let path = pathname
  try {
    path = decodeURIComponent(pathname)
  } catch {
    // Malformed escape: keep the raw path; the route 404s on unsafe slugs.
  }
  const segments = path
    .replace(/^\/md(?=\/|$)/, "")
    .replace(/\.md$/, "")
    .split("/")
    .filter(Boolean)
  if (segments.at(-1) === "index") segments.pop()
  return resolveRoute(segments)
}

/** The page's HTML URL, used as the Markdown response's canonical link. */
export function markdownPageUrl(siteUrl: string, page: DeliveryPage): string {
  const base = siteUrl.replace(/\/+$/, "")
  const prefix = page.locale === defaultLocale ? "" : `/${page.locale}`
  const slug = page.slug.replace(/^\/+/, "")
  if (!slug) return prefix ? `${base}${prefix}` : `${base}/`
  return `${base}${prefix}/${slug}`
}
