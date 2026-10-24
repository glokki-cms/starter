import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, it } from "vitest"

import { blockSchemas } from "@/blocks/registry"
import { footerSchema } from "@/layouts/default/footer"
import { headerSchema } from "@/layouts/default/header"

const ROOT = join(import.meta.dirname, "..")
const SEED = join(ROOT, "seed")
const ASSET_REF = /^seed\/assets\/[\w.-]+\.webp$/

const read = (p: string) => JSON.parse(readFileSync(p, "utf8"))
const pages = readdirSync(join(SEED, "pages"))
  .filter((f) => f.endsWith(".json"))
  .map((f) => [f, read(join(SEED, "pages", f))] as const)
const layouts = readdirSync(join(SEED, "layouts"))
  .filter((f) => f.endsWith(".json"))
  .map((f) => [f, read(join(SEED, "layouts", f))] as const)

/** Collect every string anywhere in a value that looks like a seed asset ref. */
function assetRefs(v: unknown): string[] {
  if (typeof v === "string") return ASSET_REF.test(v) ? [v] : []
  if (Array.isArray(v)) return v.flatMap(assetRefs)
  if (v && typeof v === "object") return Object.values(v).flatMap(assetRefs)
  return []
}
/** Swap asset refs for a /cdn/ URL, as the P3 importer will. */
function resolveRefs(v: unknown): unknown {
  if (typeof v === "string")
    return ASSET_REF.test(v) ? `/cdn/seed/${v.split("/").pop()}` : v
  if (Array.isArray(v)) return v.map(resolveRefs)
  if (v && typeof v === "object")
    return Object.fromEntries(
      Object.entries(v).map(([k, x]) => [k, resolveRefs(x)])
    )
  return v
}

describe("seed pages", () => {
  it("covers home/about/contact in en and pl", () => {
    expect(pages.map(([f]) => f).sort()).toEqual([
      "about.en.json",
      "about.pl.json",
      "contact.en.json",
      "contact.pl.json",
      "home.en.json",
      "home.pl.json",
    ])
  })

  describe.each(pages)("%s", (_f, page) => {
    it("has a leading-slash slug, locale, title and non-empty SEO", () => {
      expect(page.slug).toMatch(/^\//)
      expect(["en", "pl"]).toContain(page.locale)
      expect(page.title.length).toBeGreaterThan(0)
      expect(page.seo.title.length).toBeGreaterThanOrEqual(30)
      expect(page.seo.title.length).toBeLessThanOrEqual(60)
      expect(page.seo.description.length).toBeGreaterThanOrEqual(70)
      expect(page.seo.description.length).toBeLessThanOrEqual(155)
      expect(["default", "empty"]).toContain(page.layoutKey)
    })
    it("has unique node ids", () => {
      const ids = page.componentTree.map((n: { id: string }) => n.id)
      expect(new Set(ids).size).toBe(ids.length)
    })
    it("every node is a registered block whose props parse", () => {
      for (const node of page.componentTree) {
        const schema = blockSchemas[node.type]
        expect(schema, `unknown block ${node.type}`).toBeDefined()
        const result = schema.safeParse(resolveRefs(node.props))
        expect(
          result.success,
          `${node.type}: ${JSON.stringify(result.error?.issues)}`
        ).toBe(true)
      }
    })
    it("every referenced asset exists", () => {
      for (const ref of assetRefs(page.componentTree))
        expect(existsSync(join(ROOT, ref)), ref).toBe(true)
    })
  })

  it("home is slug / in both locales", () => {
    expect(
      pages.filter(([f]) => f.startsWith("home.")).map(([, p]) => p.slug)
    ).toEqual(["/", "/"])
  })
})

describe("seed layouts", () => {
  describe.each(layouts)("%s", (_f, layout) => {
    it("header and footer parse with the layout schemas", () => {
      expect(headerSchema.safeParse(resolveRefs(layout.header)).success).toBe(
        true
      )
      expect(footerSchema.safeParse(resolveRefs(layout.footer)).success).toBe(
        true
      )
    })
    it("every referenced asset exists", () => {
      for (const ref of assetRefs(layout))
        expect(existsSync(join(ROOT, ref)), ref).toBe(true)
    })
  })
})
