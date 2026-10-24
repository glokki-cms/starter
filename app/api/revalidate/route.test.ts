import { createHmac } from "node:crypto"

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const revalidateTag = vi.fn()
vi.mock("next/cache", () => ({ revalidateTag }))

function signed(body: unknown, secret = "s3cret") {
  const ts = new Date().toISOString()
  const raw = JSON.stringify(body)
  const sig = createHmac("sha256", secret).update(`${ts}.${raw}`).digest("hex")
  return new Request("http://x/api/revalidate", {
    method: "POST",
    headers: { "X-Editor-Timestamp": ts, "X-Editor-Signature": sig },
    body: raw,
  })
}

describe("POST /api/revalidate", () => {
  beforeEach(() => {
    vi.stubEnv("CMS_REVALIDATE_SECRET", "s3cret")
    revalidateTag.mockClear()
  })
  afterEach(() => vi.unstubAllEnvs())

  it("500 when the secret is not configured", async () => {
    vi.stubEnv("CMS_REVALIDATE_SECRET", "")
    const { POST } = await import("./route")
    const res = await POST(signed({ type: "invalidate", tags: ["page:x"] }))
    expect(res.status).toBe(500)
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it("401 on a bad signature, nothing revalidated", async () => {
    const { POST } = await import("./route")
    const res = await POST(signed({ type: "invalidate", tags: ["x"] }, "wrong"))
    expect(res.status).toBe(401)
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it("ping answers 200 without revalidating", async () => {
    const { POST } = await import("./route")
    const res = await POST(signed({ type: "ping" }))
    expect(res.status).toBe(200)
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  // Shapes the CMS actually sends (lib/webhooks/revalidation.ts): only the
  // invalidate payload carries a `type`.
  it.each([
    [{ type: "invalidate", tags: ["page:abc:en"] }],
    [{ slug: "/about", pageId: "p-1", revalidateInterval: 60 }],
    [
      {
        surrogateKey: "data-model:authors",
        modelKey: "authors",
        recordId: "r-1",
      },
    ],
    [{ type: "something-new" }],
  ])("content payload %j expires the cms tag immediately", async (payload) => {
    const { POST } = await import("./route")
    const res = await POST(signed(payload))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true, revalidated: "cms" })
    expect(revalidateTag).toHaveBeenCalledWith("cms", { expire: 0 })
  })
})
