import { afterEach, describe, expect, it, vi } from "vitest"

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe("robots.txt", () => {
  it("production: allow all except editor/preview helpers, with sitemap", async () => {
    vi.stubEnv("APP_ENV", "production")
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://acme.com")
    const robots = (await import("./robots")).default()
    expect(robots.rules).toEqual([
      { userAgent: "*", allow: "/", disallow: ["/api/"] },
    ])
    expect(robots.sitemap).toBe("https://acme.com/sitemap.xml")
  })
  it("non-production: disallow everything", async () => {
    vi.stubEnv("APP_ENV", "development")
    const robots = (await import("./robots")).default()
    expect(robots.rules).toEqual([{ userAgent: "*", disallow: "/" }])
    expect(robots.sitemap).toBeUndefined()
  })
})
