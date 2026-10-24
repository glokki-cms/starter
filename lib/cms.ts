import { CMSError, createClient, type DeliveryPage } from "@glokki-cms/sdk"
import { cache } from "react"

/**
 * Connection config. No side effects — safe to import anywhere.
 * No tenant fallback on purpose: a guessed slug would talk to someone
 * else's tenant. Missing values are reported by the welcome screen.
 */
export const cmsConfig = {
  baseUrl: (process.env.CMS_BASE_URL ?? "").replace(/\/+$/, ""),
  apiKey: process.env.CMS_API_KEY,
  tenantSlug: process.env.CMS_TENANT ?? "",
}

export const CMS_CACHE_TAG = "cms"
/** Seconds before a cached Delivery read is refetched without a webhook. */
export const CMS_CACHE_REVALIDATE = 3600

/**
 * Published-content client. Every read lands in the Next.js Data Cache
 * under one tag; app/api/revalidate expires it when the CMS publishes.
 * `cache: "force-cache"` is required: the page route is force-dynamic,
 * which turns every un-annotated fetch into no-store.
 * The webhook expires the tag immediately; `revalidate` is an hourly
 * backstop so a misconfigured webhook never freezes content forever.
 */
export const cms = createClient({
  ...cmsConfig,
  fetchInit: {
    cache: "force-cache",
    next: { tags: [CMS_CACHE_TAG], revalidate: CMS_CACHE_REVALIDATE },
  } as RequestInit,
})

/**
 * Redirect rules for the proxy: uncached (the proxy keeps its own
 * in-memory copy) and aborted after `timeoutMs`, because the SDK sets no
 * timeout and a hung CMS must never block a request.
 */
export function listRedirects(timeoutMs: number) {
  return createClient({
    ...cmsConfig,
    fetchInit: { cache: "no-store", signal: AbortSignal.timeout(timeoutMs) },
  }).redirects.list()
}

/** One Delivery call per slug+locale per render (metadata + page share it). */
export const getPageBySlug = cache(
  (slug: string, locale: string): Promise<DeliveryPage | null> =>
    cms.pages.getBySlug(slug, { locale })
)

// ─── Liveness ──────────────────────────────────────────
// Set once this process has rendered a published page. After that, a CMS
// outage is an outage, not a setup problem: the page route throws (an
// error status) instead of answering 200 with the setup card, which would
// tell crawlers the page is a noindex diagnostic.

let servedLivePage = false

export function markCmsHealthy(): void {
  servedLivePage = true
}

export function cmsWasHealthy(): boolean {
  return servedLivePage
}

/** @internal For tests only. */
export function _resetCmsHealth(): void {
  servedLivePage = false
}

export type CmsProbe =
  | { status: "ok"; pageCount: number }
  | { status: "unauthorized"; httpStatus: number }
  | { status: "error"; httpStatus?: number; message: string }

/** Diagnose the connection for the welcome screen. Never throws. */
export async function probeCms(locale: string): Promise<CmsProbe> {
  try {
    const { meta } = await cms.pages.list({ locale, limit: 1 })
    return { status: "ok", pageCount: meta.total }
  } catch (error) {
    if (error instanceof CMSError) {
      if (error.status === 401 || error.status === 403) {
        return { status: "unauthorized", httpStatus: error.status }
      }
      return {
        status: "error",
        httpStatus: error.status,
        message: error.message,
      }
    }
    return {
      status: "error",
      message: error instanceof Error ? error.message : String(error),
    }
  }
}
