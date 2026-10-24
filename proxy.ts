import {
  createRedirectMatcher,
  EDITOR_QUERY_PARAM,
  type RedirectMatcher,
} from "@glokki-cms/sdk"
import { type NextRequest, NextResponse } from "next/server"

import { listRedirects } from "@/lib/cms"
import { missingEnv } from "@/lib/env"

/**
 * Proxy: CMS redirects, editor/preview framing (CSP) and Markdown
 * negotiation (`Accept: text/markdown` on /about rewrites to /md/about).
 * Redirects run first, so a moved page still redirects.
 */

// ─── Redirect cache ────────────────────────────────────

const REDIRECT_CACHE_TTL = 60_000 // 1 minute
const REDIRECT_FETCH_TIMEOUT = 2_000

let cachedMatcher: RedirectMatcher | null = null
let lastFetchAt = 0
let inFlight: Promise<RedirectMatcher | null> | null = null

/** One shared fetch at a time. Never rejects; a failure keeps the old matcher. */
function refreshRedirects(): Promise<RedirectMatcher | null> {
  inFlight ??= listRedirects(REDIRECT_FETCH_TIMEOUT)
    .then((redirects) => {
      cachedMatcher = createRedirectMatcher(redirects)
      return cachedMatcher
    })
    .catch(() => cachedMatcher)
    .finally(() => {
      // Success or failure, wait a full TTL before asking again.
      lastFetchAt = Date.now()
      inFlight = null
    })
  return inFlight
}

/**
 * Only the very first load waits (at most REDIRECT_FETCH_TIMEOUT). After
 * that a stale matcher is served immediately while it refreshes in the
 * background, so a hung CMS never blocks pages served from the Data Cache.
 */
async function getRedirectMatcher(): Promise<RedirectMatcher | null> {
  // Unconfigured app (welcome screen): nothing to fetch.
  if (missingEnv(process.env).length > 0) return null
  const fresh = Date.now() - lastFetchAt < REDIRECT_CACHE_TTL
  if (fresh) return cachedMatcher
  if (cachedMatcher) {
    void refreshRedirects()
    return cachedMatcher
  }
  return refreshRedirects()
}

/** @internal Reset redirect cache — for tests only. */
export function _resetRedirectCache(): void {
  cachedMatcher = null
  lastFetchAt = 0
  inFlight = null
}

// ─── CSP ───────────────────────────────────────────────

/** CMS origin allowed to frame the site; undefined when CMS_BASE_URL is unset. */
function getCmsOrigin(): string | undefined {
  const base = process.env.CMS_BASE_URL
  if (!base) return undefined
  try {
    return new URL(base).origin
  } catch {
    return base
  }
}

// ─── Markdown negotiation ──────────────────────────────

/** Never negotiate framework files, API/CDN/OG routes, the Markdown route or files. */
const NON_PAGE_PATH_RE = /^\/(?:_next|api|cdn|og|md)(?:\/|$)|\.[^/]+$/

function isPagePath(pathname: string): boolean {
  return !NON_PAGE_PATH_RE.test(pathname)
}

function wantsMarkdown(request: NextRequest): boolean {
  return (request.headers.get("accept") ?? "").includes("text/markdown")
}

// ─── Proxy ─────────────────────────────────────────────

export default async function proxy(request: NextRequest) {
  const matcher = await getRedirectMatcher()
  const match = matcher?.match(request.nextUrl.pathname)
  if (match) {
    const url = new URL(match.target, request.url)
    if (match.preserveQueryString) {
      url.search = request.nextUrl.search
    }
    return NextResponse.redirect(url, match.statusCode)
  }

  // The Markdown route answers with `Vary: Accept`, so a cache that honours
  // Vary never hands its response to a browser.
  const { pathname } = request.nextUrl
  if (isPagePath(pathname) && wantsMarkdown(request)) {
    const url = request.nextUrl.clone()
    url.pathname = `/md${pathname === "/" ? "" : pathname}`
    return NextResponse.rewrite(url)
  }

  const isEditorMode =
    request.nextUrl.searchParams.get(EDITOR_QUERY_PARAM) === "1"
  const isPreviewMode =
    request.nextUrl.searchParams.get("preview") === "true" &&
    request.nextUrl.searchParams.has("token")
  const response = NextResponse.next()

  if (isEditorMode || isPreviewMode) {
    const cmsOrigin = getCmsOrigin()
    response.headers.set(
      "Content-Security-Policy",
      cmsOrigin
        ? `frame-ancestors 'self' ${cmsOrigin}`
        : "frame-ancestors 'self'"
    )
    // X-Frame-Options would block the iframe embed in older browsers
    response.headers.delete("X-Frame-Options")
  } else {
    response.headers.set("X-Frame-Options", "SAMEORIGIN")
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
