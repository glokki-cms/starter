import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"

import { describe, expect, it } from "vitest"

const ROOT = join(import.meta.dirname, "..")
const GUARDED = ["blocks", "layouts", "components"]

function files(dir: string): string[] {
  // blocks/ and layouts/ arrive in later tasks; skip directories not yet created.
  if (!existsSync(dir)) return []
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) return files(p)
    return /\.(ts|tsx|css)$/.test(name) && !/\.test\.tsx?$/.test(name)
      ? [p]
      : []
  })
}

const COLOR =
  /(?<![\w&/])#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})\b|\b(?:rgba?|hsla?|oklch)\(/i
const THEME = /data-theme|\b(?:paper|dusk)\b/i

describe("token guard: blocks/layouts/components use theme tokens only", () => {
  const all = GUARDED.flatMap((d) => files(join(ROOT, d)))

  it("finds files to check", () => {
    expect(all.length).toBeGreaterThan(0)
  })

  it.each(all.map((f) => [relative(ROOT, f), f]))("%s", (_rel, file) => {
    const lines = readFileSync(file, "utf8").split("\n")
    const offenders = lines
      .map((line, i) => ({ line, n: i + 1 }))
      .filter(({ line }) => COLOR.test(line) || THEME.test(line))
    expect(offenders).toEqual([])
  })
})
