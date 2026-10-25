/**
 * Subdirectory locale strategy (the CMS default):
 *   /         → default locale, "/"
 *   /about    → default locale, "/about"
 *   /pl       → pl, "/"
 *   /pl/o-nas → pl, "/o-nas"
 * Configure with CMS_LOCALES (comma-separated) and CMS_DEFAULT_LOCALE.
 */

export function parseLocales(raw: string | undefined): string[] {
  return (raw ?? "en")
    .split(",")
    .map((l) => l.trim().toLowerCase())
    .filter(Boolean)
}

export const supportedLocales: readonly string[] = parseLocales(
  process.env.CMS_LOCALES
)
export const defaultLocale: string = (process.env.CMS_DEFAULT_LOCALE ?? "en")
  .trim()
  .toLowerCase()

export type ResolvedRoute = { locale: string; slug: string }

export function resolveRoute(segments: string[] | undefined): ResolvedRoute {
  if (!segments || segments.length === 0) {
    return { locale: defaultLocale, slug: "/" }
  }
  const first = segments[0].toLowerCase()
  if (first !== defaultLocale && supportedLocales.includes(first)) {
    const rest = segments.slice(1)
    return {
      locale: first,
      slug: rest.length > 0 ? `/${rest.join("/")}` : "/",
    }
  }
  return { locale: defaultLocale, slug: `/${segments.join("/")}` }
}

export function localePrefix(locale: string): string {
  return locale === defaultLocale ? "" : `/${locale}`
}
