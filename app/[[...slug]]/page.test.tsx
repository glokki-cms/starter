import { render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// These tests exercise a non-default locale; the starter default is en only.
vi.hoisted(() => {
  process.env.CMS_LOCALES = "en,pl"
})

const { getPageBySlug, probeCms, notFound } = vi.hoisted(() => ({
  getPageBySlug: vi.fn(),
  probeCms: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND")
  }),
}))
vi.mock("@/lib/cms", async (orig) => ({
  ...(await orig<typeof import("@/lib/cms")>()),
  getPageBySlug,
  probeCms,
}))
vi.mock("@/components/editor-shell", () => ({
  EditorShell: () => <div>editor</div>,
}))
vi.mock("next/navigation", () => ({ notFound }))

const ENV = {
  CMS_BASE_URL: "http://cms",
  CMS_TENANT: "t",
  CMS_API_KEY: "k",
  CMS_REVALIDATE_SECRET: "s",
}

const PAGE = {
  title: "Home",
  slug: "/",
  locale: "en",
  publishedAt: null,
  collectionData: null,
  layout: { key: "default", header: {}, footer: {} },
  componentTree: [],
}

async function renderPage(
  slug: string[] | undefined,
  search: Record<string, string> = {}
) {
  const { default: Page } = await import("./page")
  const ui = await Page({
    params: Promise.resolve({ slug }),
    searchParams: Promise.resolve(search),
  })
  return render(ui)
}

describe("page route", () => {
  beforeEach(async () => {
    ;(await import("@/lib/cms"))._resetCmsHealth()
    for (const [k, v] of Object.entries(ENV)) vi.stubEnv(k, v)
    getPageBySlug.mockReset()
    probeCms.mockReset()
    notFound.mockClear()
  })
  afterEach(() => vi.unstubAllEnvs())

  it("is force-dynamic so next build never calls the CMS", async () => {
    expect((await import("./page")).dynamic).toBe("force-dynamic")
  })

  it("missing env → welcome (missing-env) on any slug, no CMS call", async () => {
    vi.stubEnv("CMS_API_KEY", "")
    await renderPage(["about"])
    expect(screen.getByText("CMS_API_KEY")).toBeInTheDocument()
    expect(getPageBySlug).not.toHaveBeenCalled()
  })

  it.each([[undefined], [["pl"]]])(
    "home %j of an empty tenant → no-pages welcome",
    async (slug) => {
      getPageBySlug.mockResolvedValue(null)
      probeCms.mockResolvedValue({ status: "ok", pageCount: 0 })
      await renderPage(slug as string[] | undefined)
      expect(screen.getByText(/create your first page/i)).toBeInTheDocument()
    }
  )

  it("unknown non-home slug → notFound", async () => {
    getPageBySlug.mockResolvedValue(null)
    await expect(renderPage(["nope"])).rejects.toThrow("NEXT_NOT_FOUND")
    expect(probeCms).not.toHaveBeenCalled()
  })

  it("home missing but other pages exist → notFound", async () => {
    getPageBySlug.mockResolvedValue(null)
    probeCms.mockResolvedValue({ status: "ok", pageCount: 3 })
    await expect(renderPage(undefined)).rejects.toThrow("NEXT_NOT_FOUND")
  })

  it("fetch throws → diagnosed welcome (unauthorized)", async () => {
    getPageBySlug.mockRejectedValue(new Error("x"))
    probeCms.mockResolvedValue({ status: "unauthorized", httpStatus: 401 })
    await renderPage(["about"])
    expect(screen.getByText(/HTTP 401/)).toBeInTheDocument()
  })

  it("first run: unreachable CMS → diagnosed welcome card", async () => {
    getPageBySlug.mockRejectedValue(new TypeError("fetch failed"))
    probeCms.mockResolvedValue({ status: "error", message: "fetch failed" })
    await renderPage(["about"])
    expect(screen.getByText(/fetch failed/)).toBeInTheDocument()
  })

  it.each([
    [{ status: "error", message: "fetch failed" }],
    [{ status: "error", httpStatus: 502, message: "Bad gateway" }],
  ])(
    "live site: CMS outage %j → throws with cause, never the welcome card",
    async (probe) => {
      getPageBySlug.mockResolvedValueOnce(PAGE)
      await renderPage(undefined)
      const outage = new TypeError("fetch failed")
      getPageBySlug.mockRejectedValue(outage)
      probeCms.mockResolvedValue(probe)
      const err = await renderPage(["about"]).catch((e: unknown) => e)
      expect(err).toBeInstanceOf(Error)
      expect((err as Error).cause).toBe(outage)
    }
  )

  it("healthy probe after a failed read → rethrows with cause", async () => {
    const boom = new Error("boom")
    getPageBySlug.mockRejectedValue(boom)
    probeCms.mockResolvedValue({ status: "ok", pageCount: 3 })
    const err = await renderPage(["about"]).catch((e: unknown) => e)
    expect((err as Error).message).toMatch(/Failed to load en:\/about/)
    expect((err as Error).cause).toBe(boom)
  })

  it("editor mode renders the editor shell", async () => {
    await renderPage(["about"], { _editor: "1" })
    expect(screen.getByText("editor")).toBeInTheDocument()
  })

  it("renders a published page's blocks inside its layout", async () => {
    getPageBySlug.mockResolvedValue({
      title: "Home",
      slug: "/",
      locale: "en",
      publishedAt: null,
      collectionData: null,
      layout: {
        key: "default",
        header: { siteName: "Acme" },
        footer: { legal: "© Acme" },
      },
      componentTree: [
        {
          id: "1",
          type: "cta",
          props: {
            heading: "Ready?",
            buttonLabel: "Go",
            buttonHref: "/x",
            variant: "accent",
          },
        },
      ],
    })
    await renderPage(undefined)
    expect(screen.getByText("Ready?")).toBeInTheDocument()
    expect(screen.getByText("© Acme")).toBeInTheDocument()
  })

  it("declares the page locale on the content, chrome included", async () => {
    getPageBySlug.mockResolvedValue({
      title: "Start",
      slug: "/",
      locale: "pl",
      publishedAt: null,
      collectionData: null,
      layout: { key: "default", header: {}, footer: { legal: "© Acme PL" } },
      componentTree: [
        {
          id: "1",
          type: "cta",
          props: {
            heading: "Gotowi?",
            buttonLabel: "Start",
            buttonHref: "/pl",
          },
        },
      ],
    })
    await renderPage(["pl"])
    expect(getPageBySlug).toHaveBeenCalledWith("/", "pl")
    expect(screen.getByText("Gotowi?").closest("[lang]")).toHaveAttribute(
      "lang",
      "pl"
    )
    expect(screen.getByText("© Acme PL").closest("[lang]")).toHaveAttribute(
      "lang",
      "pl"
    )
  })
})
