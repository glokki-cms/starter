import { defineBlock } from "@glokki-cms/sdk"
import { z } from "zod"

import { Section } from "@/components/ui/section"
import { SectionHeading } from "@/components/ui/section-heading"
import { cn } from "@/lib/utils"

import { FEATURE_ICON_NAMES, FEATURE_ICONS } from "./icons"

const item = z.object({
  icon: z.enum(FEATURE_ICON_NAMES).default("sparkles").describe("Icon"),
  title: z.string().min(1).max(80).describe("Title"),
  text: z
    .string()
    .max(300)
    .optional()
    .meta({ fieldType: "textarea" })
    .describe("Text"),
})
const DEFAULT_ITEMS = [
  {
    icon: "zap",
    title: "Fast by default",
    text: "Pages are cached at the edge and refresh the moment you publish.",
  },
  {
    icon: "globe",
    title: "Every language",
    text: "Translate each page and keep one structure across locales.",
  },
  {
    icon: "shield",
    title: "Your code, your domain",
    text: "The site runs in your own repository and hosting account.",
  },
] as const
export const featuresGridSchema = z.object({
  eyebrow: z.string().max(60).optional().describe("Eyebrow"),
  heading: z.string().max(120).optional().describe("Heading"),
  description: z
    .string()
    .max(300)
    .optional()
    .meta({ fieldType: "textarea" })
    .describe("Description"),
  columns: z.enum(["2", "3", "4"]).default("3").describe("Columns"),
  items: z
    .array(item)
    .default([...DEFAULT_ITEMS])
    .meta({ fieldType: "repeater" })
    .describe("Features"),
})

const COLS = {
  "2": "sm:grid-cols-2",
  "3": "sm:grid-cols-2 lg:grid-cols-3",
  "4": "sm:grid-cols-2 lg:grid-cols-4",
} as const

function FeaturesGrid({
  eyebrow,
  heading,
  description,
  columns,
  items = [],
}: z.infer<typeof featuresGridSchema>) {
  return (
    <Section>
      <SectionHeading
        eyebrow={eyebrow}
        title={heading}
        description={description}
      />
      <ul className={cn("grid gap-6", COLS[columns])}>
        {items.map((it, i) => {
          const Icon = FEATURE_ICONS[it.icon]
          return (
            <li
              key={`${it.title}-${i}`}
              className="rounded-theme-lg border-line bg-surface border p-6"
            >
              <span className="rounded-theme bg-accent-soft inline-flex size-10 items-center justify-center text-accent">
                <Icon aria-hidden className="size-5" />
              </span>
              <h3 className="heading text-fg mt-5 text-lg">{it.title}</h3>
              {it.text && <p className="mt-2 text-sm text-muted">{it.text}</p>}
            </li>
          )
        })}
      </ul>
    </Section>
  )
}

export const FeaturesGridBlock = defineBlock({
  type: "features-grid",
  label: "Features grid",
  category: "sections",
  icon: "LayoutGrid",
  description: "Grid of features or services with icons",
  defaultProps: {
    eyebrow: "Why us",
    heading: "Everything a modern website needs",
    columns: "3",
    items: [...DEFAULT_ITEMS],
  },
  propsSchema: featuresGridSchema,
  summary: { field: "items", noun: "feature" },
  markdown: (p, { md }) =>
    [
      p.heading && md.heading(2, p.heading),
      p.description && md.escape(p.description),
      ...(p.items ?? []).map(
        (it) =>
          `${md.heading(3, it.title)}${it.text ? `\n\n${md.escape(it.text)}` : ""}`
      ),
    ]
      .filter(Boolean)
      .join("\n\n"),
  component: FeaturesGrid,
})
