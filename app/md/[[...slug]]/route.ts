import { createMarkdownRoute } from "@glokki-cms/sdk"

import { blockRegistry } from "@/blocks/registry"
import { cms } from "@/lib/cms"
import { markdownPageUrl, resolveMarkdownRequest } from "@/lib/markdown"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001"

/**
 * Every published page as Markdown for LLM agents:
 *
 *   /about.md, /pl/o-nas.md, /index.md   ← rewrite in next.config.ts
 *   /about with Accept: text/markdown    ← rewrite in proxy.ts
 *
 * `cms` is the published-content client, never a preview client: responses
 * are cached publicly, so a draft served here would leak to everyone.
 */
export const { GET } = createMarkdownRoute({
  client: cms,
  blockRegistry,
  siteUrl,
  resolve: resolveMarkdownRequest,
  pageUrl: (page) => markdownPageUrl(siteUrl, page),
})
