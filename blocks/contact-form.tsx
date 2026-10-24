"use client"

import { FormBlock } from "@glokki-cms/react"
import { type CMSClient, createClient } from "@glokki-cms/sdk"

// The Delivery key is public (delivery:read) and safe in the browser.
// next.config.ts copies CMS_* into these NEXT_PUBLIC_* names at build time.
let client: CMSClient | null = null
function getClient(): CMSClient {
  client ??= createClient({
    baseUrl: process.env.NEXT_PUBLIC_CMS_BASE_URL ?? "",
    apiKey: process.env.NEXT_PUBLIC_CMS_API_KEY,
    tenantSlug: process.env.NEXT_PUBLIC_CMS_TENANT ?? "",
  })
  return client
}

export function ContactForm({
  formId,
  submitLabel,
}: {
  formId: string
  submitLabel?: string
}) {
  return (
    <FormBlock client={getClient()} formId={formId} submitLabel={submitLabel} />
  )
}
