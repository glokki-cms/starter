import { cn } from "@/lib/utils"

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  as: Tag = "h2",
}: {
  eyebrow?: string
  title?: string
  description?: string
  align?: "center" | "left"
  as?: "h1" | "h2"
}) {
  if (!eyebrow && !title && !description) return null
  return (
    <div
      className={cn(
        "mb-12 max-w-2xl",
        align === "center" && "mx-auto text-center"
      )}
    >
      {eyebrow && (
        <p className="text-xs font-semibold tracking-[0.12em] text-accent uppercase">
          {eyebrow}
        </p>
      )}
      {title && (
        <Tag
          className={cn(
            "heading text-fg mt-3",
            Tag === "h1"
              ? "text-4xl sm:text-5xl lg:text-6xl"
              : "text-3xl sm:text-4xl"
          )}
        >
          {title}
        </Tag>
      )}
      {description && (
        <p className="mt-4 text-base text-muted sm:text-lg">{description}</p>
      )}
    </div>
  )
}
