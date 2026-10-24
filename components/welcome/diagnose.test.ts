import { describe, expect, it } from "vitest"

import { diagnose } from "./diagnose"

describe("diagnose", () => {
  it("missing env wins over everything", () => {
    expect(
      diagnose({
        missing: ["CMS_API_KEY"],
        probe: { status: "ok", pageCount: 0 },
      })
    ).toEqual({ kind: "missing-env", missing: ["CMS_API_KEY"] })
  })
  it("unauthorized", () => {
    expect(
      diagnose({
        missing: [],
        probe: { status: "unauthorized", httpStatus: 401 },
      })
    ).toEqual({ kind: "unauthorized", httpStatus: 401 })
  })
  it("network error → unreachable", () => {
    expect(
      diagnose({
        missing: [],
        probe: { status: "error", message: "fetch failed" },
      })
    ).toEqual({ kind: "unreachable", message: "fetch failed" })
  })
  it("http error → cms-error", () => {
    expect(
      diagnose({
        missing: [],
        probe: { status: "error", httpStatus: 500, message: "boom" },
      })
    ).toEqual({ kind: "cms-error", httpStatus: 500, message: "boom" })
  })
  it("zero pages → no-pages", () => {
    expect(
      diagnose({ missing: [], probe: { status: "ok", pageCount: 0 } })
    ).toEqual({ kind: "no-pages" })
  })
  it("pages exist → null (healthy)", () => {
    expect(
      diagnose({ missing: [], probe: { status: "ok", pageCount: 4 } })
    ).toBeNull()
  })
})
