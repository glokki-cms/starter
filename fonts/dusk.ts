import { Space_Grotesk } from "next/font/google"

/**
 * Fonts for the dusk theme. next.config aliases `@theme-fonts` to the
 * active theme's module, so only these families are preloaded; the other
 * themes' fonts never enter the build. next/font options must be literals.
 */

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--font-space-grotesk",
  display: "swap",
})

export const fontVariables = spaceGrotesk.variable
