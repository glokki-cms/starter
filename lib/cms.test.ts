import { afterEach, describe, expect, it, vi } from "vitest"

afterEach(() => {
  vi.unstubAllGlobals()
  vi.resetModules()
})

function mockFetch(
  impl: (url: string, init?: RequestInit) => Response | Promise<Response>
) {
  const fn = vi.fn(impl)
  vi.stubGlobal("fetch", fn)
  return fn
}

describe("cms client", () => {
  it("tags every Delivery read with the cms cache tag", async () => {
    const fetchFn = mockFetch(() =>
      Response.json({ data: [], meta: { total: 0, limit: 1, offset: 0 } })
    )
    const { cms } = await import("./cms")
    await cms.pages.list({ limit: 1 })
    const init = fetchFn.mock.calls[0][1] as RequestInit & {
      next?: { tags?: string[] }
    }
    expect(init.next?.tags).toEqual(["cms"])
  })

  it("opts every Delivery read into the Data Cache explicitly", async () => {
    // The page route is force-dynamic, which makes un-annotated fetches
    // no-store: tags alone would never cache anything.
    const fetchFn = mockFetch(() =>
      Response.json({ data: [], meta: { total: 0, limit: 1, offset: 0 } })
    )
    const { cms } = await import("./cms")
    await cms.pages.list({ limit: 1 })
    expect(fetchFn.mock.calls[0][1]?.cache).toBe("force-cache")
  })

  it("expires cached reads hourly as a backstop to the webhook", async () => {
    // A misconfigured webhook must not freeze content forever.
    const fetchFn = mockFetch(() =>
      Response.json({ data: [], meta: { total: 0, limit: 1, offset: 0 } })
    )
    const { cms } = await import("./cms")
    await cms.pages.list({ limit: 1 })
    const init = fetchFn.mock.calls[0][1] as RequestInit & {
      next?: { revalidate?: number }
    }
    expect(init.next?.revalidate).toBe(3600)
  })
})

describe("probeCms", () => {
  it("ok with the page count", async () => {
    mockFetch(() =>
      Response.json({
        data: [{ slug: "/" }],
        meta: { total: 3, limit: 1, offset: 0 },
      })
    )
    const { probeCms } = await import("./cms")
    expect(await probeCms("en")).toEqual({ status: "ok", pageCount: 3 })
  })
  it.each([401, 403])("unauthorized on %i", async (code) => {
    mockFetch(() =>
      Response.json(
        { error: { code: "UNAUTHORIZED", message: "no" } },
        { status: code }
      )
    )
    const { probeCms } = await import("./cms")
    expect(await probeCms("en")).toEqual({
      status: "unauthorized",
      httpStatus: code,
    })
  })
  it("error with status on 500", async () => {
    mockFetch(() =>
      Response.json({ error: { code: "X", message: "boom" } }, { status: 500 })
    )
    const { probeCms } = await import("./cms")
    expect(await probeCms("en")).toMatchObject({
      status: "error",
      httpStatus: 500,
    })
  })
  it("error without status on network failure", async () => {
    mockFetch(() => {
      throw new TypeError("fetch failed")
    })
    const { probeCms } = await import("./cms")
    const r = await probeCms("en")
    expect(r.status).toBe("error")
    expect(r).not.toHaveProperty("httpStatus")
  })
})

describe("listRedirects", () => {
  it("is uncached and aborts a hung CMS after the timeout", async () => {
    const fetchFn = mockFetch(
      (_url, init) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () =>
            reject(init.signal?.reason)
          )
        })
    )
    const { listRedirects } = await import("./cms")
    await expect(listRedirects(20)).rejects.toMatchObject({
      name: "TimeoutError",
    })
    const init = fetchFn.mock.calls[0][1] as RequestInit & {
      next?: { tags?: string[] }
    }
    expect(init.cache).toBe("no-store")
    expect(init.next).toBeUndefined()
  })
})
