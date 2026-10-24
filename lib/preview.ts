import { createClient } from "@glokki-cms/sdk"

import { cmsConfig } from "./cms"

type PreviewParams =
  | { isPreview: true; token: string }
  | { isPreview: false; token: undefined }

/**
 * Parse preview mode from search params.
 * Returns a discriminated union so TypeScript narrows `token` to `string`
 * inside `if (isPreview)` checks without non-null assertions.
 */
export function parsePreviewParams(
  searchParams: Record<string, string | string[] | undefined>
): PreviewParams {
  const preview = searchParams.preview
  const token =
    typeof searchParams.token === "string" ? searchParams.token : undefined
  if (preview === "true" && token) {
    return { isPreview: true, token }
  }
  return { isPreview: false, token: undefined }
}

/**
 * Create a CMS client configured for preview mode.
 *
 * Preview requests bypass the cache and fetch draft (unpublished) content
 * using the preview token for authentication. Never cached.
 */
export function createPreviewClient(token: string) {
  return createClient({
    ...cmsConfig,
    preview: true,
    previewToken: token,
    fetchInit: { cache: "no-store" },
  })
}
