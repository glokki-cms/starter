import { NextRequest } from "next/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const list = vi.hoisted(() => vi.fn())
vi.mock("@/lib/cms", () => ({ listRedirects: list }))

const redirect = (over: Record<string, unknown> = {}) => ({
  id: "r-1",
  source: "/old",
  target: "/new",
  type: "permanent",
  isRegex: false,
  preserveQueryString: false,
  ...over,
})

function req(path: string, headers: Record<string, string> = {}) {
  return new NextRequest(new URL(path, "http://localhost:3001"), { headers })
}

function rewriteTarget(response: Response): string | null {
  const t = response.headers.get("x-middleware-rewrite")
  return t ? new URL(t).pathname : null
}

async function load() {
  vi.resetModules()
  return import("./proxy")
}

afterEach(() => {
  vi.restoreAllMocks()
})

beforeEach(() => {
  list.mockReset()
  list.mockResolvedValue([])
  vi.unstubAllEnvs()
  vi.stubEnv("CMS_BASE_URL", "http://cms")
  vi.stubEnv("CMS_TENANT", "acme")
  vi.stubEnv("CMS_API_KEY", "k")
  vi.stubEnv("CMS_REVALIDATE_SECRET", "s")
})

describe("redirects", () => {
  it("redirects with the rule status and location", async () => {
    list.mockResolvedValue([redirect()])
    const { default: proxy } = await load()
    const res = await proxy(req("/old?x=1"))
    expect(res.status).toBe(301)
    expect(res.headers.get("location")).toBe("http://localhost:3001/new")
  })

  it("uses 302 for temporary rules and keeps the query when asked", async () => {
    list.mockResolvedValue([
      redirect({ type: "temporary", preserveQueryString: true }),
    ])
    const { default: proxy } = await load()
    const res = await proxy(req("/old?utm=g"))
    expect(res.status).toBe(302)
    expect(res.headers.get("location")).toBe("http://localhost:3001/new?utm=g")
  })

  it("does not call the CMS when required env is missing", async () => {
    vi.stubEnv("CMS_API_KEY", "")
    const { default: proxy } = await load()
    const res = await proxy(req("/old"))
    expect(list).not.toHaveBeenCalled()
    expect(res.headers.get("X-Frame-Options")).toBe("SAMEORIGIN")
  })

  it("skips redirects when the CMS is unreachable", async () => {
    list.mockRejectedValue(new Error("ECONNREFUSED"))
    const { default: proxy } = await load()
    const res = await proxy(req("/old"))
    expect(res.status).toBe(200)
  })

  it("caches the redirect list for the TTL", async () => {
    const { default: proxy } = await load()
    await proxy(req("/a"))
    await proxy(req("/b"))
    expect(list).toHaveBeenCalledTimes(1)
  })

  it("bounds every redirect fetch with a timeout", async () => {
    const { default: proxy } = await load()
    await proxy(req("/a"))
    expect(list).toHaveBeenCalledWith(2000)
  })

  it("concurrent requests share one in-flight fetch", async () => {
    let resolve!: (v: unknown[]) => void
    list.mockReturnValue(new Promise((r) => (resolve = r)))
    const { default: proxy } = await load()
    const pending = [proxy(req("/old")), proxy(req("/old")), proxy(req("/x"))]
    resolve([redirect()])
    const results = await Promise.all(pending)
    expect(list).toHaveBeenCalledTimes(1)
    expect(results[0].status).toBe(301)
    expect(results[1].status).toBe(301)
  })

  it("serves the stale matcher at once while a hung CMS refreshes", async () => {
    list.mockResolvedValueOnce([redirect()])
    const now = vi.spyOn(Date, "now").mockReturnValue(1_000_000)
    const { default: proxy } = await load()
    expect((await proxy(req("/old"))).status).toBe(301)

    // TTL elapsed; the CMS now hangs forever.
    now.mockReturnValue(1_000_000 + 61_000)
    list.mockReturnValue(new Promise(() => {}))
    const res = await proxy(req("/old"))
    expect(res.status).toBe(301)
    expect(list).toHaveBeenCalledTimes(2)

    // Further requests neither wait nor fire another fetch.
    expect((await proxy(req("/old"))).status).toBe(301)
    expect(list).toHaveBeenCalledTimes(2)
  })

  it("swaps in the refreshed matcher once the background fetch lands", async () => {
    list.mockResolvedValueOnce([redirect()])
    const now = vi.spyOn(Date, "now").mockReturnValue(1_000_000)
    const { default: proxy } = await load()
    await proxy(req("/old"))

    now.mockReturnValue(1_000_000 + 61_000)
    list.mockResolvedValueOnce([redirect({ source: "/gone", target: "/x" })])
    await proxy(req("/a")) // kicks the refresh
    await vi.waitFor(async () =>
      expect((await proxy(req("/gone"))).status).toBe(301)
    )
    expect((await proxy(req("/old"))).status).toBe(200)
  })

  it("a failed first load proceeds without redirects and backs off", async () => {
    list.mockRejectedValue(new Error("timeout"))
    const { default: proxy } = await load()
    expect((await proxy(req("/old"))).status).toBe(200)
    expect((await proxy(req("/old"))).status).toBe(200)
    expect(list).toHaveBeenCalledTimes(1)
  })
})

describe("framing", () => {
  it("editor mode sets frame-ancestors and drops X-Frame-Options", async () => {
    const { default: proxy } = await load()
    const res = await proxy(req("/?_editor=1"))
    expect(res.headers.get("Content-Security-Policy")).toBe(
      "frame-ancestors 'self' http://cms"
    )
    expect(res.headers.get("X-Frame-Options")).toBeNull()
  })

  it("preview mode with token is framable", async () => {
    const { default: proxy } = await load()
    const res = await proxy(req("/about?preview=true&token=t"))
    expect(res.headers.get("Content-Security-Policy")).toBe(
      "frame-ancestors 'self' http://cms"
    )
  })

  it("without CMS_BASE_URL falls back to 'self' only", async () => {
    vi.stubEnv("CMS_BASE_URL", "")
    const { default: proxy } = await load()
    const res = await proxy(req("/?_editor=1"))
    expect(res.headers.get("Content-Security-Policy")).toBe(
      "frame-ancestors 'self'"
    )
  })

  it("normal requests get X-Frame-Options: SAMEORIGIN and no CSP", async () => {
    const { default: proxy } = await load()
    const res = await proxy(req("/about"))
    expect(res.headers.get("X-Frame-Options")).toBe("SAMEORIGIN")
    expect(res.headers.get("Content-Security-Policy")).toBeNull()
  })
})

describe("Markdown negotiation", () => {
  const md = { accept: "text/markdown" }

  it.each([
    ["/about", "/md/about"],
    ["/pl/o-nas", "/md/pl/o-nas"],
    ["/", "/md"],
  ])("rewrites %s to %s", async (path, target) => {
    const { default: proxy } = await load()
    expect(rewriteTarget(await proxy(req(path, md)))).toBe(target)
  })

  it.each(["/api/x", "/cdn/x.png", "/og/x", "/md/about", "/about.md"])(
    "does not rewrite %s",
    async (path) => {
      const { default: proxy } = await load()
      expect(rewriteTarget(await proxy(req(path, md)))).toBeNull()
    }
  )

  it("leaves HTML requests alone", async () => {
    const { default: proxy } = await load()
    expect(
      rewriteTarget(await proxy(req("/about", { accept: "text/html" })))
    ).toBeNull()
  })

  it("redirects win over negotiation", async () => {
    list.mockResolvedValue([redirect()])
    const { default: proxy } = await load()
    const res = await proxy(req("/old", md))
    expect(res.status).toBe(301)
    expect(rewriteTarget(res)).toBeNull()
  })
})
