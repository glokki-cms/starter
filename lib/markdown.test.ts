import { describe, expect, it } from "vitest"

import { markdownPageUrl, resolveMarkdownRequest } from "./markdown"

const r = (path: string) =>
  resolveMarkdownRequest(new Request(`https://a.com${path}`))

describe("resolveMarkdownRequest", () => {
  it("maps paths to locale + slug", () => {
    expect(r("/md/about")).toEqual({ locale: "en", slug: "/about" })
    expect(r("/md/pl/o-nas")).toEqual({ locale: "pl", slug: "/o-nas" })
    expect(r("/md/index")).toEqual({ locale: "en", slug: "/" })
    expect(r("/md/pl/index")).toEqual({ locale: "pl", slug: "/" })
  })
  it("does not throw on a malformed escape", () => {
    expect(() => r("/md/%E0%A4%A")).not.toThrow()
  })
})

describe("markdownPageUrl", () => {
  it("builds the HTML URL", () => {
    expect(
      markdownPageUrl("https://a.com/", {
        locale: "pl",
        slug: "/o-nas",
      } as never)
    ).toBe("https://a.com/pl/o-nas")
    expect(
      markdownPageUrl("https://a.com/", { locale: "en", slug: "/" } as never)
    ).toBe("https://a.com/")
  })
})
