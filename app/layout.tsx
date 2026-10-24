import "./globals.css"

import { fontVariables } from "@theme-fonts"
import type { Metadata } from "next"
import type { ReactNode } from "react"

import { resolveTheme } from "@/lib/env"
import { defaultLocale } from "@/lib/i18n"

const theme = resolveTheme(process.env.NEXT_PUBLIC_THEME)

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001"
  ),
}

/**
 * Root layout. Site chrome (header/footer) is rendered per page through
 * PageLayoutFrame and the layout registry — nothing CMS-related here.
 * `@theme-fonts` is aliased in next.config to fonts/<active theme>.ts, so
 * only that theme's families are loaded and preloaded.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={defaultLocale} data-theme={theme} className={fontVariables}>
      <body className="bg-bg font-body text-fg min-h-screen">{children}</body>
    </html>
  )
}
