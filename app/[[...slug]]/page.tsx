import {
  cmsMetadata,
  CMSPage,
  PageLayoutFrame,
  PreviewBanner,
} from "@glokki-cms/react"
import { type DeliveryPage, EDITOR_QUERY_PARAM } from "@glokki-cms/sdk"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { blockRegistry, registry } from "@/blocks/registry"
import { EditorShell } from "@/components/editor-shell"
import { diagnose } from "@/components/welcome/diagnose"
import { WelcomeScreen } from "@/components/welcome/welcome-screen"
import { layoutRegistry } from "@/layouts/registry"
import {
  cmsWasHealthy,
  getPageBySlug,
  markCmsHealthy,
  probeCms,
} from "@/lib/cms"
import { missingEnv } from "@/lib/env"
import { resolveRoute } from "@/lib/i18n"
import { createPreviewClient, parsePreviewParams } from "@/lib/preview"

// Every request is rendered on demand (Delivery reads are still cached by
// tag). This also keeps `next build` from calling the CMS — a fresh deploy
// must build before anything is published.
export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{ slug?: string[] }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function Page({ params, searchParams }: PageProps) {
  const [{ slug }, search] = await Promise.all([params, searchParams])
  const { locale, slug: pageSlug } = resolveRoute(slug)
  const cmsUrl = process.env.CMS_BASE_URL

  if (search[EDITOR_QUERY_PARAM] === "1")
    return <EditorShell pageSlug={pageSlug} />

  const missing = missingEnv(process.env)
  if (missing.length > 0)
    return <WelcomeScreen state={{ kind: "missing-env", missing }} />

  const { isPreview, token } = parsePreviewParams(search)
  let page: DeliveryPage | null
  try {
    page = isPreview
      ? await createPreviewClient(token).pages.getBySlug(pageSlug, { locale })
      : await getPageBySlug(pageSlug, locale)
  } catch (error) {
    const state = diagnose({ missing, probe: await probeCms(locale) })
    // The setup card is for first-run diagnosis. Once this site has served
    // a live page, a CMS outage must not answer 200 + noindex with it.
    const outage = state?.kind === "unreachable" || state?.kind === "cms-error"
    if (state && !(outage && cmsWasHealthy()))
      return <WelcomeScreen state={state} cmsUrl={cmsUrl} />
    throw new Error(`Failed to load ${locale}:${pageSlug}`, { cause: error })
  }

  if (!page) {
    if (pageSlug !== "/") notFound()
    const state = diagnose({ missing, probe: await probeCms(locale) })
    if (state) return <WelcomeScreen state={state} cmsUrl={cmsUrl} />
    notFound()
  }

  if (!isPreview) markCmsHealthy()

  // The root layout can't see the route locale, so <html lang> is always the
  // default; declare the page's own language here (WCAG 3.1.1). `contents`
  // keeps the wrapper out of the layout.
  return (
    <div lang={page.locale} className="contents">
      <PageLayoutFrame
        registry={layoutRegistry}
        layoutKey={page.layout.key}
        headerData={page.layout.header}
        footerData={page.layout.footer}
      >
        {isPreview && <PreviewBanner />}
        <CMSPage
          componentTree={page.componentTree}
          registry={registry}
          blockRegistry={blockRegistry}
          data={{
            title: page.title,
            slug: page.slug,
            locale: page.locale,
            publishedAt: page.publishedAt,
            collectionData: page.collectionData ?? null,
          }}
        />
      </PageLayoutFrame>
    </div>
  )
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const [{ slug }, search] = await Promise.all([params, searchParams])
  const noindex: Metadata = { robots: { index: false, follow: false } }
  if (
    parsePreviewParams(search).isPreview ||
    missingEnv(process.env).length > 0
  )
    return noindex
  const { locale, slug: pageSlug } = resolveRoute(slug)
  try {
    const page = await getPageBySlug(pageSlug, locale)
    if (!page) return noindex
    return cmsMetadata(page, {
      baseUrl: process.env.NEXT_PUBLIC_SITE_URL,
      env: process.env.APP_ENV,
    })
  } catch {
    return noindex
  }
}
