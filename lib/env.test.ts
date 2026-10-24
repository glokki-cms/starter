import { describe, expect, it } from "vitest"

import { missingEnv, resolveAppEnv, resolveSiteUrl, resolveTheme } from "./env"

describe("resolveTheme", () => {
  it.each([
    [undefined, "grid"],
    ["", "grid"],
    ["paper", "paper"],
    ["dusk", "dusk"],
    [" Dusk ", "dusk"],
    ["PAPER", "paper"],
    ["neon", "grid"],
  ])("%j → %s", (raw, expected) => {
    expect(resolveTheme(raw)).toBe(expected)
  })
})

describe("resolveAppEnv", () => {
  it("explicit APP_ENV wins over VERCEL_ENV", () => {
    expect(
      resolveAppEnv({ APP_ENV: "staging", VERCEL_ENV: "production" })
    ).toBe("staging")
  })
  it("Vercel production → production", () => {
    expect(resolveAppEnv({ VERCEL_ENV: "production" })).toBe("production")
  })
  it("Vercel preview → development", () => {
    expect(resolveAppEnv({ VERCEL_ENV: "preview" })).toBe("development")
  })
  it("nothing set → development (fail-safe noindex)", () => {
    expect(resolveAppEnv({})).toBe("development")
  })
  it("blank APP_ENV is treated as unset", () => {
    expect(resolveAppEnv({ APP_ENV: "  ", VERCEL_ENV: "production" })).toBe(
      "production"
    )
  })
})

describe("missingEnv", () => {
  it("lists every absent or blank required variable, in order", () => {
    expect(missingEnv({ CMS_BASE_URL: "http://x", CMS_API_KEY: " " })).toEqual([
      "CMS_TENANT",
      "CMS_API_KEY",
      "CMS_REVALIDATE_SECRET",
    ])
  })
  it("empty when all are present", () => {
    expect(
      missingEnv({
        CMS_BASE_URL: "a",
        CMS_TENANT: "b",
        CMS_API_KEY: "c",
        CMS_REVALIDATE_SECRET: "d",
      })
    ).toEqual([])
  })
})

describe("resolveSiteUrl", () => {
  it("explicit NEXT_PUBLIC_SITE_URL wins, trailing slash stripped", () => {
    expect(
      resolveSiteUrl({
        NEXT_PUBLIC_SITE_URL: "https://acme.com/",
        VERCEL_PROJECT_PRODUCTION_URL: "acme.vercel.app",
      })
    ).toBe("https://acme.com")
  })
  it("falls back to the Vercel production host", () => {
    expect(
      resolveSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "acme.vercel.app" })
    ).toBe("https://acme.vercel.app")
  })
  it("falls back to localhost", () => {
    expect(resolveSiteUrl({})).toBe("http://localhost:3001")
  })
})
