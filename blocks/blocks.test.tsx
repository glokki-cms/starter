import { render } from "@testing-library/react"
import type { ComponentType } from "react"
import { describe, expect, it } from "vitest"

import { THEMES } from "@/lib/env"

import { blockRegistry, blockSchemas } from "./registry"

const EXPECTED_TYPES = [
  "hero",
  "rich-text",
  "features-grid",
  "media-text",
  "image",
  "logo-cloud",
  "testimonials",
  "faq",
  "cta",
  "contact",
]

const definitions = new Map(
  blockRegistry.getSerializedDefinitions().map((d) => [d.type, d])
)

describe("block registry", () => {
  it("registers exactly the expected blocks", () => {
    expect([...blockRegistry.getTypes()].sort()).toEqual(
      [...EXPECTED_TYPES].sort()
    )
  })

  it("keeps a schema for every registered block", () => {
    expect(Object.keys(blockSchemas).sort()).toEqual([...EXPECTED_TYPES].sort())
  })

  it.each(EXPECTED_TYPES)("%s: defaultProps satisfy its own schema", (type) => {
    const schema = blockSchemas[type]
    expect(schema.safeParse(definitions.get(type)!.defaultProps).success).toBe(
      true
    )
  })

  it.each(EXPECTED_TYPES)(
    "%s: schema rejects nothing an empty editor sends ({})",
    (type) => {
      expect(blockSchemas[type].safeParse({}).success).toBe(true)
    }
  )
})

describe.each(THEMES)("renders under theme %s", (theme) => {
  it.each(EXPECTED_TYPES)("%s", (type) => {
    const Component = blockRegistry.getComponent(type) as ComponentType<
      Record<string, unknown>
    >
    const props = blockSchemas[type].parse(
      definitions.get(type)!.defaultProps
    ) as Record<string, unknown>
    const { container } = render(
      <div data-theme={theme}>
        <Component {...props} />
      </div>
    )
    expect(container.textContent?.trim().length).toBeGreaterThan(0)
  })
})

describe("rich text styling", () => {
  it.each(["rich-text", "media-text"])(
    "%s: html container carries the typography `prose` class",
    (type) => {
      const Component = blockRegistry.getComponent(type) as ComponentType<
        Record<string, unknown>
      >
      const props = blockSchemas[type].parse(
        definitions.get(type)!.defaultProps
      ) as Record<string, unknown>
      const { container } = render(<Component {...props} />)
      const el = container.querySelector(".prose-theme")
      expect(el).not.toBeNull()
      expect(el!.classList.contains("prose")).toBe(true)
    }
  )
})
