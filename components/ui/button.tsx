import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type Variant = "primary" | "secondary" | "ghost"
type Size = "md" | "lg"

export function buttonClasses({
  variant = "primary",
  size = "md",
}: { variant?: Variant; size?: Size } = {}) {
  return cn(
    "rounded-theme inline-flex items-center justify-center gap-2 font-medium transition-colors focus-visible:outline-2",
    size === "lg" ? "px-6 py-3 text-base" : "px-4 py-2 text-sm",
    variant === "primary" && "text-on-accent bg-accent hover:opacity-90",
    variant === "secondary" && "border-line text-fg hover:bg-surface border",
    variant === "ghost" && "text-fg hover:bg-surface"
  )
}

export function ButtonLink({
  href,
  variant,
  size,
  className,
  children,
}: {
  href: string
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
}) {
  return (
    <a href={href} className={cn(buttonClasses({ variant, size }), className)}>
      {children}
    </a>
  )
}
