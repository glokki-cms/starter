import { render } from "@testing-library/react"
import type { ComponentType } from "react"
import { describe, expect, it } from "vitest"

import { blockRegistry } from "./registry"

const Faq = blockRegistry.getComponent("faq") as ComponentType<
  Record<string, unknown>
>

describe("faq", () => {
  it("emits FAQPage JSON-LD with every question and answer", () => {
    const { container } = render(
      <Faq
        items={[
          { question: "Q1?", answer: "A1" },
          { question: "Q2?", answer: "A2" },
        ]}
      />
    )
    const ld = JSON.parse(
      container.querySelector('script[type="application/ld+json"]')!
        .textContent!
    )
    expect(ld["@type"]).toBe("FAQPage")
    expect(ld.mainEntity).toEqual([
      {
        "@type": "Question",
        name: "Q1?",
        acceptedAnswer: { "@type": "Answer", text: "A1" },
      },
      {
        "@type": "Question",
        name: "Q2?",
        acceptedAnswer: { "@type": "Answer", text: "A2" },
      },
    ])
  })
  it("emits no JSON-LD when there are no questions", () => {
    const { container } = render(<Faq items={[]} />)
    expect(
      container.querySelector('script[type="application/ld+json"]')
    ).toBeNull()
  })
  it("uses native details/summary so it works without JavaScript", () => {
    const { container } = render(
      <Faq items={[{ question: "Q?", answer: "A" }]} />
    )
    expect(container.querySelector("details summary")?.textContent).toContain(
      "Q?"
    )
  })
})
