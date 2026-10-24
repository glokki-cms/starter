"use client"

import { VisualEditorContext } from "@glokki-cms/react"
import { useContext } from "react"

import { FormCard } from "@/components/ui/form-card"

/**
 * "No form connected" instructions, shown only inside the visual editor
 * (the `isEditorMode` signal the SDK's own editor-only UI uses; public
 * renders have no provider). The copy lives in this client module on
 * purpose: passed from a server component as children it would be
 * serialized into every visitor's RSC payload even when not rendered.
 */
export function ContactSetupHint() {
  if (!useContext(VisualEditorContext)?.isEditorMode) return null
  return (
    <FormCard>
      <div className="py-10 text-center text-sm text-muted">
        <p className="text-fg font-medium">No form connected yet</p>
        <p className="mt-2">
          Create a form in glokki (Forms), copy its ID and paste it into this
          block.
        </p>
      </div>
    </FormCard>
  )
}
