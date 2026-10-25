import { afterEach, describe, expect, it, vi } from "vitest"

import { localePrefix, parseLocales, resolveRoute } from "./i18n"

describe("parseLocales", () => {
  it("defaults to en only (a new CMS organization has just en)", () => {
    expect(parseLocales(undefined)).toEqual(["en"])
  })
  it("trims, lowercases and drops empties", () => {
    expect(parseLocales(" EN, de ,,")).toEqual(["en", "de"])
  })
})

describe("resolveRoute (CMS_LOCALES unset)", () => {
  it("treats /pl as a plain slug, not a locale", () => {
    expect(resolveRoute(["pl", "o-nas"])).toEqual({
      locale: "en",
      slug: "/pl/o-nas",
    })
  })
})

describe("resolveRoute (CMS_LOCALES=en,pl)", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })
  async function load() {
    vi.stubEnv("CMS_LOCALES", "en,pl")
    vi.resetModules()
    return (await import("./i18n")).resolveRoute
  }
  it.each([
    [undefined, { locale: "en", slug: "/" }],
    [[], { locale: "en", slug: "/" }],
    [["about"], { locale: "en", slug: "/about" }],
    [["pl"], { locale: "pl", slug: "/" }],
    [["pl", "o-nas"], { locale: "pl", slug: "/o-nas" }],
    [["PL", "kontakt"], { locale: "pl", slug: "/kontakt" }],
    [["en", "about"], { locale: "en", slug: "/en/about" }],
  ])("%j", async (segments, expected) => {
    const route = await load()
    expect(route(segments as string[] | undefined)).toEqual(expected)
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
