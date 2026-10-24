import type { ReactNode } from "react"

/** The bordered card the contact block puts its form (or setup hint) in. */
export function FormCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-theme-lg border-line bg-surface border p-6 sm:p-8 lg:col-span-3">
      {children}
    </div>
  )
}
