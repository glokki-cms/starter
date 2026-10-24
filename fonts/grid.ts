import { Inter_Tight } from "next/font/google"

/**
 * Fonts for the grid theme. next.config aliases `@theme-fonts` to the
 * active theme's module, so only these families are preloaded; the other
 * themes' fonts never enter the build. next/font options must be literals.
 */

const interTight = Inter_Tight({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter-tight",
  display: "swap",
})

export const fontVariables = interTight.variable
