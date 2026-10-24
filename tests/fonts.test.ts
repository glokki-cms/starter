import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

import { afterEach, describe, expect, it, vi } from "vitest"

import { THEMES } from "@/lib/env"

const ROOT = join(import.meta.dirname, "..")
const read = (...p: string[]) => readFileSync(join(ROOT, ...p), "utf8")

/** `--font-*` variables a file declares (font module) or uses (theme css). */
const fontVars = (src: string, re: RegExp) =>
  new Set([...src.matchAll(re)].map((m) => m[1]))

describe.each(THEMES)("fonts/%s.ts", (theme) => {
  const file = join(ROOT, "fonts", `${theme}.ts`)

  it("exists", () => {
    expect(existsSync(file)).toBe(true)
  })

  it("loads exactly the font variables its theme css uses", () => {
    const declared = fontVars(
      read("fonts", `${theme}.ts`),
      /variable:\s*"(--font-[\w-]+)"/g
    )
    const used = fontVars(
      read("themes", `${theme}.css`),
      /var\((--font-[\w-]+)\)/g
    )
    expect(declared).toEqual(used)
  })
})

describe("app/layout.tsx", () => {
  it("imports only the active theme's fonts, never next/font directly", () => {
    // Every next/font loader in the root layout's graph is preloaded on
    // every page; the alias keeps the other themes' families out of it.
    const layout = read("app", "layout.tsx")
    expect(layout).toContain('from "@theme-fonts"')
    expect(layout).not.toContain("next/font")
  })
})

describe("next.config @theme-fonts alias", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it.each([
    [undefined, "grid"],
    [" Dusk ", "dusk"],
    ["paper", "paper"],
  ])("NEXT_PUBLIC_THEME=%j → fonts/%s.ts", async (raw, theme) => {
    vi.stubEnv("NEXT_PUBLIC_THEME", raw ?? "")
    const { default: config } = await import("../next.config")
    expect(config.turbopack?.resolveAlias?.["@theme-fonts"]).toBe(
      `./fonts/${theme}.ts`
    )
  })
})
