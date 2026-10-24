import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { WelcomeScreen } from "./welcome-screen"

describe("WelcomeScreen", () => {
  it("lists missing variable names, never values", () => {
    render(
      <WelcomeScreen
        state={{ kind: "missing-env", missing: ["CMS_API_KEY", "CMS_TENANT"] }}
      />
    )
    expect(screen.getByText("CMS_API_KEY")).toBeInTheDocument()
    expect(screen.getByText("CMS_TENANT")).toBeInTheDocument()
  })
  it("unauthorized explains key/tenant and shows the status", () => {
    render(<WelcomeScreen state={{ kind: "unauthorized", httpStatus: 401 }} />)
    expect(screen.getByText(/401/)).toBeInTheDocument()
    expect(screen.getByText(/CMS_API_KEY/)).toBeInTheDocument()
  })
  it("unreachable points at CMS_BASE_URL", () => {
    render(
      <WelcomeScreen state={{ kind: "unreachable", message: "fetch failed" }} />
    )
    expect(screen.getByText(/CMS_BASE_URL/)).toBeInTheDocument()
  })
  it("no-pages links to the CMS editor", () => {
    render(
      <WelcomeScreen
        state={{ kind: "no-pages" }}
        cmsUrl="https://cms.example.com"
      />
    )
    expect(screen.getByRole("link", { name: /open glökki/i })).toHaveAttribute(
      "href",
      "https://cms.example.com/pages"
    )
  })
})
