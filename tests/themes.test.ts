import { readFileSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, it } from "vitest"

import { THEMES } from "@/lib/env"

const TOKENS = [
  "--bg",
  "--fg",
  "--muted",
  "--surface",
  "--line",
  "--accent",
  "--on-accent",
  "--accent-soft",
  "--theme-font-display",
  "--theme-font-body",
  "--radius",
  "--radius-lg",
  "--heading-weight",
  "--heading-tracking",
]

describe.each(THEMES)("themes/%s.css", (theme) => {
  const css = readFileSync(
    join(import.meta.dirname, "..", "themes", `${theme}.css`),
    "utf8"
  )

  it("is scoped to its data-theme selector", () => {
    expect(css).toContain(`[data-theme="${theme}"]`)
  })

  it.each(TOKENS)("defines %s", (token) => {
    expect(css).toMatch(new RegExp(`${token}\\s*:`))
  })

  it("contains only custom properties inside rule blocks", () => {
    const declarations = [...css.matchAll(/^\s*([a-z-]+)\s*:/gim)].map(
      (m) => m[1]
    )
    expect(declarations.filter((d) => !d.startsWith("--"))).toEqual([])
  })
})

describe("globals.css imports every theme", () => {
  const css = readFileSync(
    join(import.meta.dirname, "..", "app", "globals.css"),
    "utf8"
  )
  it.each(THEMES)("%s", (t) => {
    expect(css).toContain(`../themes/${t}.css`)
  })
})
