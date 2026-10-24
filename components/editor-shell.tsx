"use client"

import { CMSPageEditor, VisualEditorProvider } from "@glokki-cms/react"

import { blockRegistry, registry } from "@/blocks/registry"
import { layoutRegistry } from "@/layouts/registry"

/**
 * The CMS loads this page in an iframe with ?_editor=1. The registries are
 * functions and can't cross the server→client boundary, so the provider
 * is created here, in a client module. The handshake ships the block and
 * layout definitions to the CMS — that's how the CMS learns this site's
 * blocks (and mirrors them for publishing).
 */
export function EditorShell({ pageSlug }: { pageSlug: string }) {
  return (
    <VisualEditorProvider
      registry={registry}
      blockRegistry={blockRegistry}
      layoutRegistry={layoutRegistry}
      pageSlug={pageSlug}
      // No fallback on purpose: a guessed slug would fail the cross-tenant guard.
      tenantSlug={process.env.NEXT_PUBLIC_CMS_TENANT || undefined}
    >
      <CMSPageEditor />
    </VisualEditorProvider>
  )
}
