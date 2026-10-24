/**
 * Pure environment parsing. No side effects at import time — config,
 * tests and next.config.ts all import this file.
 */

export const THEMES = ["paper", "grid", "dusk"] as const
export type ThemeName = (typeof THEMES)[number]
export const DEFAULT_THEME: ThemeName = "grid"

export function resolveTheme(raw: string | undefined): ThemeName {
  const value = raw?.trim().toLowerCase()
  return (THEMES as readonly string[]).includes(value ?? "")
    ? (value as ThemeName)
    : DEFAULT_THEME
}

const blank = (v: string | undefined) => !v || v.trim() === ""

/**
 * The environment `cmsMetadata()` and robots.ts key indexing off. Anything
 * other than "production" means noindex — so an unset value on a non-Vercel
 * host keeps the site out of search engines rather than in.
 */
export function resolveAppEnv(env: {
  APP_ENV?: string
  VERCEL_ENV?: string
  [key: string]: string | undefined
}): string {
  if (!blank(env.APP_ENV)) return env.APP_ENV!.trim()
  return env.VERCEL_ENV === "production" ? "production" : "development"
}

export const REQUIRED_ENV = [
  "CMS_BASE_URL",
  "CMS_TENANT",
  "CMS_API_KEY",
  "CMS_REVALIDATE_SECRET",
] as const

export function missingEnv(env: Record<string, string | undefined>): string[] {
  return REQUIRED_ENV.filter((name) => blank(env[name]))
}

export function resolveSiteUrl(env: {
  NEXT_PUBLIC_SITE_URL?: string
  VERCEL_PROJECT_PRODUCTION_URL?: string
  [key: string]: string | undefined
}): string {
  if (!blank(env.NEXT_PUBLIC_SITE_URL)) {
    return env.NEXT_PUBLIC_SITE_URL!.trim().replace(/\/+$/, "")
  }
  if (!blank(env.VERCEL_PROJECT_PRODUCTION_URL)) {
    return `https://${env.VERCEL_PROJECT_PRODUCTION_URL!.trim()}`
  }
  return "http://localhost:3001"
}
