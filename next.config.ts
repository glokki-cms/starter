import type { NextConfig } from "next"

import { resolveAppEnv, resolveSiteUrl, resolveTheme } from "./lib/env"

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  // Pin the Turbopack root to this app. Inside the CMS monorepo Next would
  // otherwise infer the repo root (it has its own lockfile) and compile the
  // CMS's proxy.ts; harmless when the starter is copied out on its own.
  // `@theme-fonts` resolves to the active theme's font module only: every
  // next/font loader in the root layout's graph is preloaded on every page.
  turbopack: {
    root: import.meta.dirname,
    resolveAlias: {
      "@theme-fonts": `./fonts/${resolveTheme(process.env.NEXT_PUBLIC_THEME)}.ts`,
    },
  },
  // One set of variables for the user to fill in; client modules (the
  // editor tenant guard, FormBlock) get their copies here at build time.
  // The Delivery key is a public delivery:read key, safe in browser bundles.
  env: {
    APP_ENV: resolveAppEnv(process.env),
    NEXT_PUBLIC_SITE_URL: resolveSiteUrl(process.env),
    NEXT_PUBLIC_CMS_BASE_URL: process.env.CMS_BASE_URL ?? "",
    NEXT_PUBLIC_CMS_TENANT: process.env.CMS_TENANT ?? "",
    NEXT_PUBLIC_CMS_API_KEY: process.env.CMS_API_KEY ?? "",
  },
  // Markdown for agents: /about.md → app/md/[[...slug]]/route.ts
  async rewrites() {
    return [{ source: "/:path*.md", destination: "/md/:path*" }]
  },
}

export default nextConfig
