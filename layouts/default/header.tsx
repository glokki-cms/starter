import { z } from "zod"

import { buttonClasses } from "@/components/ui/button"
import { defaultLocale, localePrefix, supportedLocales } from "@/lib/i18n"

export type NavItem = {
  label: string
  href: string
  target?: "_self" | "_blank"
  children?: NavItem[]
}

const navItemSchema: z.ZodType<NavItem> = z.lazy(() =>
  z.object({
    label: z.string().default(""),
    href: z.string().default(""),
    target: z.enum(["_self", "_blank"]).optional(),
    children: z.array(navItemSchema).optional(),
  })
)

export const headerSchema = z.object({
  siteName: z.string().max(60).default("Your company").describe("Site name"),
  logo: z
    .string()
    .optional()
    .meta({ fieldType: "image" })
    .describe("Logo (optional)"),
  items: z
    .array(navItemSchema)
    .default([])
    .meta({ fieldType: "menu-tree", maxDepth: 2 })
    .describe("Navigation"),
  ctaLabel: z.string().max(40).optional().describe("Button label"),
  ctaHref: z.string().default("/contact").describe("Button link"),
  showLocaleSwitcher: z
    .boolean()
    .default(true)
    .meta({ fieldType: "switch" })
    .describe("Show language switcher"),
})
export type HeaderData = z.infer<typeof headerSchema>

// Default locale first, then the rest in configured order.
const orderedLocales = [...supportedLocales].sort(
  (a, b) => Number(b === defaultLocale) - Number(a === defaultLocale)
)

export function Header({ data }: { data: HeaderData }) {
  return (
    <header className="border-line bg-bg/90 sticky top-0 z-20 border-b backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        {/* Plain anchors on purpose: layouts also render in the CMS editor iframe, outside the Next router. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/"
          className="heading text-fg flex items-center gap-2 text-lg"
          aria-label={data.logo ? data.siteName : undefined}
        >
          {data.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.logo} alt="" className="h-8 w-auto" />
          ) : (
            data.siteName
          )}
        </a>

        {data.items.length > 0 && (
          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-7 text-sm">
              {data.items.map((item, i) => (
                <li key={`${item.href}-${i}`} className="group relative">
                  <a
                    href={item.href}
                    target={item.target}
                    rel={item.target === "_blank" ? "noreferrer" : undefined}
                    className="hover:text-fg text-muted transition-colors"
                  >
                    {item.label}
                  </a>
                  {item.children && item.children.length > 0 && (
                    <ul className="rounded-theme border-line bg-bg invisible absolute top-full left-0 mt-2 min-w-48 border p-2 opacity-0 shadow-lg transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                      {item.children.map((child, j) => (
                        <li key={`${child.href}-${j}`}>
                          <a
                            href={child.href}
                            className="rounded-theme hover:bg-surface hover:text-fg block px-3 py-2 text-muted"
                          >
                            {child.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="flex items-center gap-4">
          {/* Links go to each locale's home: per-page translation links need the page's alternates, which the layout header does not receive. */}
          {data.showLocaleSwitcher && orderedLocales.length > 1 && (
            <ul
              className="flex items-center gap-2 text-xs font-medium"
              aria-label="Language"
            >
              {orderedLocales.map((locale) => (
                <li key={locale}>
                  <a
                    href={localePrefix(locale) || "/"}
                    hrefLang={locale}
                    className="hover:text-fg text-muted uppercase"
                  >
                    {locale.toUpperCase()}
                  </a>
                </li>
              ))}
            </ul>
          )}
          {data.ctaLabel && (
            <a href={data.ctaHref} className={buttonClasses({ size: "md" })}>
              {data.ctaLabel}
            </a>
          )}
        </div>
      </div>
      {data.items.length > 0 && (
        <nav aria-label="Mobile" className="border-line border-t md:hidden">
          <ul className="mx-auto flex max-w-6xl gap-5 overflow-x-auto px-6 py-3 text-sm">
            {data.items.map((item, i) => (
              <li key={`m-${item.href}-${i}`}>
                <a
                  href={item.href}
                  className="hover:text-fg whitespace-nowrap text-muted"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}
