import { readFileSync } from "node:fs"
import { join } from "node:path"

import {
  VisualEditorContext,
  type VisualEditorContextValue,
} from "@glokki-cms/react"
import { render, screen } from "@testing-library/react"
import type { ComponentType, ReactElement } from "react"
import { describe, expect, it, vi } from "vitest"

vi.mock("./contact-form", () => ({
  ContactForm: ({ formId }: { formId: string }) => (
    <div data-testid="form">{formId}</div>
  ),
}))

import { blockRegistry } from "./registry"

const Contact = blockRegistry.getComponent("contact") as ComponentType<
  Record<string, unknown>
>

function renderInEditor(ui: ReactElement) {
  const value = { isEditorMode: true } as VisualEditorContextValue
  return render(
    <VisualEditorContext.Provider value={value}>
      {ui}
    </VisualEditorContext.Provider>
  )
}

describe("contact", () => {
  it("shows a setup hint in the editor when no form id is set", () => {
    renderInEditor(<Contact heading="Talk to us" formId="" />)
    expect(screen.queryByTestId("form")).toBeNull()
    expect(screen.getByText(/create a form in glokki/i)).toBeInTheDocument()
  })
  it("never shows the setup hint to public visitors", () => {
    render(<Contact heading="Talk to us" formId="" email="hi@acme.test" />)
    expect(screen.queryByText(/create a form in glokki/i)).toBeNull()
    expect(screen.queryByText(/no form connected/i)).toBeNull()
    expect(screen.getByText("Talk to us")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "hi@acme.test" })).toBeVisible()
  })
  it("hides the hint when the provider is mounted outside editor mode", () => {
    const value = { isEditorMode: false } as VisualEditorContextValue
    render(
      <VisualEditorContext.Provider value={value}>
        <Contact formId="" />
      </VisualEditorContext.Provider>
    )
    expect(screen.queryByText(/create a form in glokki/i)).toBeNull()
  })
  it("renders the CMS form when a form id is set", () => {
    render(<Contact formId="0b5d6c1e-7c1c-4a53-9a3e-0e0f6b2b1a11" />)
    expect(screen.getByTestId("form")).toHaveTextContent("0b5d6c1e")
  })
  it("renders email and phone as links", () => {
    render(<Contact formId="" email="hi@acme.test" phone="+48 600 000 000" />)
    expect(screen.getByRole("link", { name: "hi@acme.test" })).toHaveAttribute(
      "href",
      "mailto:hi@acme.test"
    )
    expect(
      screen.getByRole("link", { name: "+48 600 000 000" })
    ).toHaveAttribute("href", "tel:+48600000000")
  })
  it("keeps the hint copy out of the server module (and the RSC payload)", () => {
    const src = readFileSync(join(import.meta.dirname, "contact.tsx"), "utf8")
    expect(src).not.toMatch(/no form connected/i)
  })
})
