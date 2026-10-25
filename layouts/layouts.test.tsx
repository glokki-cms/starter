import { render, screen } from "@testing-library/react"
import { join } from "node:path"

import { describe, expect, it, vi } from "vitest"

import { Footer, footerSchema } from "./default/footer"
import { Header, headerSchema } from "./default/header"
import { layoutRegistry } from "./registry"

// These tests exercise a non-default locale; the starter default is en only.
vi.hoisted(() => {
  process.env.CMS_LOCALES = "en,pl"
})

describe("layout registry", () => {
  it("has exactly default and empty", () => {
    // LayoutRegistry is a ReadonlyMap<string, LayoutDefinition>
    expect([...layoutRegistry.keys()].sort()).toEqual(["default", "empty"])
    expect(layoutRegistry.get("default")?.key).toBe("default")
  })
})

describe("header", () => {
  it("parses {} to usable defaults", () => {
    expect(headerSchema.safeParse({}).success).toBe(true)
  })
  it("renders the text logo when no logo image is set, and the nav", () => {
    const data = headerSchema.parse({
      siteName: "Acme",
      items: [{ label: "About", href: "/about" }],
    })
    render(<Header data={data} />)
    expect(screen.getByRole("link", { name: "Acme" })).toHaveAttribute(
      "href",
      "/"
    )
    expect(screen.getAllByRole("link", { name: "About" })[0]).toHaveAttribute(
      "href",
      "/about"
    )
  })
  it("renders a locale switch link per supported locale", () => {
    render(<Header data={headerSchema.parse({ showLocaleSwitcher: true })} />)
    expect(screen.getByRole("link", { name: "EN" })).toHaveAttribute(
      "href",
      "/"
    )
    expect(screen.getByRole("link", { name: "PL" })).toHaveAttribute(
      "href",
      "/pl"
    )
  })
})

describe("footer", () => {
  it("parses {} to usable defaults", () => {
    expect(footerSchema.safeParse({}).success).toBe(true)
  })
  it("renders columns and the legal line", () => {
    const data = footerSchema.parse({
      columns: [
        { title: "Company", links: [{ label: "About", href: "/about" }] },
      ],
      legal: "© 2026 Acme",
    })
    render(<Footer data={data} />)
    expect(screen.getByText("Company")).toBeInTheDocument()
    expect(screen.getByText("© 2026 Acme")).toBeInTheDocument()
  })
  it("does not use the preprocess/catch pattern (serializes as text — candidate 18 #4)", async () => {
    const src = await import("node:fs").then((fs) =>
      fs.readFileSync(join(import.meta.dirname, "default/footer.tsx"), "utf8")
    )
    expect(src).not.toMatch(/\.preprocess\(|\.catch\(/)
  })
})
