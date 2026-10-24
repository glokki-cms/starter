import { createHmac } from "node:crypto"

import { describe, expect, it } from "vitest"

import { REPLAY_WINDOW_MS, verifySignedRequest } from "./webhook"

const SECRET = "s3cret"
function signed(
  body: unknown,
  { ts = new Date().toISOString(), secret = SECRET } = {}
) {
  const raw = JSON.stringify(body)
  const sig = createHmac("sha256", secret).update(`${ts}.${raw}`).digest("hex")
  return new Request("http://x/api/revalidate", {
    method: "POST",
    headers: { "X-Editor-Timestamp": ts, "X-Editor-Signature": sig },
    body: raw,
  })
}

describe("verifySignedRequest", () => {
  it("accepts a correctly signed fresh payload", async () => {
    const r = await verifySignedRequest(signed({ type: "ping" }), SECRET)
    expect(r).toEqual({ ok: true, payload: { type: "ping" } })
  })
  it("rejects a wrong secret with 401", async () => {
    const r = await verifySignedRequest(
      signed({ type: "ping" }, { secret: "nope" }),
      SECRET
    )
    expect(r).toEqual({ ok: false, status: 401 })
  })
  it("rejects missing headers with 401", async () => {
    const req = new Request("http://x", { method: "POST", body: "{}" })
    expect(await verifySignedRequest(req, SECRET)).toEqual({
      ok: false,
      status: 401,
    })
  })
  it("rejects a payload older than the replay window with 401", async () => {
    const old = new Date(Date.now() - REPLAY_WINDOW_MS - 1000).toISOString()
    expect(
      await verifySignedRequest(signed({ type: "ping" }, { ts: old }), SECRET)
    ).toEqual({ ok: false, status: 401 })
  })
  it("rejects a non-date timestamp with 401", async () => {
    expect(
      await verifySignedRequest(signed({}, { ts: "yesterday" }), SECRET)
    ).toEqual({ ok: false, status: 401 })
  })
  it("rejects a signed non-JSON body with 400", async () => {
    const ts = new Date().toISOString()
    const sig = createHmac("sha256", SECRET)
      .update(`${ts}.not-json`)
      .digest("hex")
    const req = new Request("http://x", {
      method: "POST",
      headers: { "X-Editor-Timestamp": ts, "X-Editor-Signature": sig },
      body: "not-json",
    })
    expect(await verifySignedRequest(req, SECRET)).toEqual({
      ok: false,
      status: 400,
    })
  })
})
