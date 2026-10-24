import { describe, expect, it } from "vitest"

import { parsePreviewParams } from "./preview"

describe("parsePreviewParams", () => {
  it("preview with token", () => {
    expect(parsePreviewParams({ preview: "true", token: "t" })).toEqual({
      isPreview: true,
      token: "t",
    })
  })
  it("preview without token is not preview", () => {
    expect(parsePreviewParams({ preview: "true" }).isPreview).toBe(false)
  })
  it("token without preview is not preview", () => {
    expect(parsePreviewParams({ token: "t" }).isPreview).toBe(false)
  })
  it("array preview value is not preview", () => {
    expect(
      parsePreviewParams({ preview: ["true"], token: "t" }).isPreview
    ).toBe(false)
  })
})
