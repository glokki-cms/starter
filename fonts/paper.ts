import { Fraunces, Source_Serif_4 } from "next/font/google"

/**
 * Fonts for the paper theme. next.config aliases `@theme-fonts` to the
 * active theme's module, so only these families are preloaded; the other
 * themes' fonts never enter the build. next/font options must be literals.
 */

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-fraunces",
  display: "swap",
})
const sourceSerif = Source_Serif_4({
  subsets: ["latin", "latin-ext"],
  variable: "--font-source-serif",
  display: "swap",
})

export const fontVariables = [fraunces.variable, sourceSerif.variable].join(" ")
