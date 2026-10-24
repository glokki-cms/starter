import { revalidateTag } from "next/cache"

import { CMS_CACHE_TAG } from "@/lib/cms"
import { verifySignedRequest } from "@/lib/webhook"

/**
 * The one endpoint the CMS notifies on every content change.
 * Point Settings → Visual Editor → Revalidation URL at
 * https://<your-site>/api/revalidate and set the same secret here.
 *
 * The whole site's Delivery reads share the "cms" tag, so any content
 * change expires everything at once (`expire: 0` = no stale window).
 * Coarse on purpose: a company site has tens of pages, and this needs no
 * external cache store. See README → "Caching" for the precise upgrade.
 *
 * Any verified payload except a ping counts as a content change. The CMS
 * sends three shapes here and only `{ type: "invalidate", tags }` carries a
 * `type`; page revalidation (`{ slug, pageId, … }`) and data-model purges
 * (`{ modelKey, recordId, … }`) don't, so matching on `type` would miss them.
 */
export async function POST(request: Request) {
  const secret = process.env.CMS_REVALIDATE_SECRET
  if (!secret) {
    return Response.json(
      { error: "CMS_REVALIDATE_SECRET not configured" },
      { status: 500 }
    )
  }

  const result = await verifySignedRequest(request, secret)
  if (!result.ok) return new Response(null, { status: result.status })

  const type = (result.payload as { type?: unknown } | null)?.type
  if (type === "ping") return Response.json({ ok: true })
  revalidateTag(CMS_CACHE_TAG, { expire: 0 })
  return Response.json({ ok: true, revalidated: CMS_CACHE_TAG })
}
