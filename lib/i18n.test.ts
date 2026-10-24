import { describe, expect, it } from "vitest"

import { localePrefix, parseLocales, resolveRoute } from "./i18n"

describe("parseLocales", () => {
  it("defaults to en,pl", () => {
    expect(parseLocales(undefined)).toEqual(["en", "pl"])
  })
  it("trims, lowercases and drops empties", () => {
    expect(parseLocales(" EN, de ,,")).toEqual(["en", "de"])
  })
})

describe("resolveRoute (defaults: en default, pl supported)", () => {
  it.each([
    [undefined, { locale: "en", slug: "/" }],
    [[], { locale: "en", slug: "/" }],
    [["about"], { locale: "en", slug: "/about" }],
    [["pl"], { locale: "pl", slug: "/" }],
    [["pl", "o-nas"], { locale: "pl", slug: "/o-nas" }],
    [["PL", "kontakt"], { locale: "pl", slug: "/kontakt" }],
    [["en", "about"], { locale: "en", slug: "/en/about" }],
  ])("%j", (segments, expected) => {
    expect(resolveRoute(segments as string[] | undefined)).toEqual(expected)
  })
})

describe("localePrefix", () => {
  it("is empty for the default locale", () => {
    expect(localePrefix("en")).toBe("")
  })
  it("is /<locale> otherwise", () => {
    expect(localePrefix("pl")).toBe("/pl")
  })
})
