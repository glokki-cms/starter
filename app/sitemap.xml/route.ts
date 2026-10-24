const CMS_BASE_URL = (process.env.CMS_BASE_URL ?? "").replace(/\/+$/, "")
// Your public origin, e.g. https://acme.com — the host every <loc> will use.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!

// Never prerender at build time: it would fetch the CMS (absent on a fresh deploy).
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const url = new URL(`${CMS_BASE_URL}/api/v1/delivery/sitemap.xml`)
  url.searchParams.set("base_url", SITE_URL)

  const headers: Record<string, string> = {
    Authorization: `Bearer ${process.env.CMS_API_KEY}`,
    "X-Tenant-Slug": process.env.CMS_TENANT!,
  }
  const ifNoneMatch = request.headers.get("if-none-match")
  if (ifNoneMatch) headers["If-None-Match"] = ifNoneMatch

  let upstream: Response
  try {
    upstream = await fetch(url, { headers, cache: "no-store" })
  } catch {
    return unavailable()
  }

  if (upstream.status === 304) {
    return new Response(null, { status: 304, headers: passthrough(upstream) })
  }
  if (!upstream.ok) return unavailable()

  return new Response(upstream.body, {
    status: 200,
    headers: passthrough(upstream),
  })
}

function passthrough(upstream: Response): Record<string, string> {
  const out: Record<string, string> = {}
  for (const name of ["content-type", "cache-control", "etag"]) {
    const value = upstream.headers.get(name)
    if (value) out[name] = value
  }
  return out
}

// A 5xx tells crawlers to come back later instead of treating the sitemap as gone.
function unavailable() {
  return new Response("Sitemap temporarily unavailable", {
    status: 503,
    headers: { "Retry-After": "300", "Cache-Control": "no-store" },
  })
}
