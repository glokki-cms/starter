import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const fetchMock = vi.fn()

async function load() {
  vi.resetModules()
  return (await import("./route")).GET
}

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal("fetch", fetchMock)
  vi.stubEnv("CMS_BASE_URL", "https://cms.example.com///")
  vi.stubEnv("CMS_API_KEY", "key-123")
  vi.stubEnv("CMS_TENANT", "acme")
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://acme.com")
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

const req = (headers: Record<string, string> = {}) =>
  new Request("https://acme.com/sitemap.xml", { headers })

describe("sitemap.xml route", () => {
  it("is force-dynamic so the build never fetches the CMS", async () => {
    vi.resetModules()
    expect((await import("./route")).dynamic).toBe("force-dynamic")
  })

  it("passes body and headers through and calls upstream correctly", async () => {
    fetchMock.mockResolvedValue(
      new Response("<urlset/>", {
        status: 200,
        headers: {
          "content-type": "application/xml",
          "cache-control": "s-maxage=3600",
          etag: '"abc"',
          "x-secret": "no",
        },
      })
    )
    const GET = await load()
    const res = await GET(req())

    expect(res.status).toBe(200)
    expect(await res.text()).toBe("<urlset/>")
    expect(res.headers.get("content-type")).toBe("application/xml")
    expect(res.headers.get("cache-control")).toBe("s-maxage=3600")
    expect(res.headers.get("etag")).toBe('"abc"')
    expect(res.headers.get("x-secret")).toBeNull()

    const [url, init] = fetchMock.mock.calls[0]
    const u = new URL(String(url))
    expect(u.origin + u.pathname).toBe(
      "https://cms.example.com/api/v1/delivery/sitemap.xml"
    )
    expect(u.searchParams.get("base_url")).toBe("https://acme.com")
    expect(init.headers.Authorization).toBe("Bearer key-123")
    expect(init.headers["X-Tenant-Slug"]).toBe("acme")
    expect(init.headers["If-None-Match"]).toBeUndefined()
    expect(init.cache).toBe("no-store")
  })

  it("forwards If-None-Match and maps upstream 304 to 304", async () => {
    fetchMock.mockResolvedValue(
      new Response(null, { status: 304, headers: { etag: '"abc"' } })
    )
    const GET = await load()
    const res = await GET(req({ "if-none-match": '"abc"' }))

    expect(fetchMock.mock.calls[0][1].headers["If-None-Match"]).toBe('"abc"')
    expect(res.status).toBe(304)
    expect(res.headers.get("etag")).toBe('"abc"')
  })

  it("answers 503 with Retry-After when upstream is 401", async () => {
    fetchMock.mockResolvedValue(new Response("nope", { status: 401 }))
    const GET = await load()
    const res = await GET(req())

    expect(res.status).toBe(503)
    expect(res.headers.get("Retry-After")).toBe("300")
  })

  it("answers 503 when the network throws", async () => {
    fetchMock.mockRejectedValue(new Error("ECONNREFUSED"))
    const GET = await load()
    const res = await GET(req())

    expect(res.status).toBe(503)
    expect(res.headers.get("Retry-After")).toBe("300")
  })
})
