import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

const WIDTH = {
  narrow: "max-w-3xl",
  default: "max-w-6xl",
  wide: "max-w-7xl",
} as const

export function Section({
  children,
  className,
  width = "default",
  tone = "default",
  id,
}: {
  children: ReactNode
  className?: string
  width?: keyof typeof WIDTH
  tone?: "default" | "surface"
  id?: string
}) {
  return (
    <section
      id={id}
      className={cn(
        "px-6 py-16 sm:px-8 sm:py-24",
        tone === "surface" && "bg-surface",
        className
      )}
    >
      <div className={cn("mx-auto", WIDTH[width])}>{children}</div>
    </section>
  )
}
