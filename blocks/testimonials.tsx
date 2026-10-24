import { CdnImage } from "@glokki-cms/react"
import { defineBlock } from "@glokki-cms/sdk"
import { z } from "zod"

import { Section } from "@/components/ui/section"
import { SectionHeading } from "@/components/ui/section-heading"

const quote = z.object({
  quote: z
    .string()
    .min(1)
    .max(600)
    .meta({ fieldType: "textarea" })
    .describe("Quote"),
  name: z.string().min(1).max(80).describe("Name"),
  role: z.string().max(80).optional().describe("Role / company"),
  avatar: z.string().optional().meta({ fieldType: "image" }).describe("Photo"),
})
const DEFAULT_QUOTES = [
  {
    quote:
      "We publish changes in minutes now, without waiting for a developer.",
    name: "Anna Kowalska",
    role: "Marketing lead",
  },
  {
    quote:
      "The site got faster and our editors finally stopped being afraid of it.",
    name: "Tomás Rivera",
    role: "Founder",
  },
]
export const testimonialsSchema = z.object({
  eyebrow: z.string().max(60).optional().describe("Eyebrow"),
  heading: z.string().max(120).optional().describe("Heading"),
  items: z
    .array(quote)
    .default(DEFAULT_QUOTES)
    .meta({ fieldType: "repeater" })
    .describe("Testimonials"),
})

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function Testimonials({
  eyebrow,
  heading,
  items = [],
}: z.infer<typeof testimonialsSchema>) {
  return (
    <Section tone="surface">
      <SectionHeading eyebrow={eyebrow} title={heading} />
      <ul className="grid gap-6 md:grid-cols-2">
        {items.map((t, i) => (
          <li key={`${t.name}-${i}`}>
            <figure className="rounded-theme-lg border-line bg-bg flex h-full flex-col justify-between border p-8">
              <blockquote className="heading text-fg text-xl">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-3">
                {t.avatar ? (
                  <CdnImage
                    src={t.avatar}
                    alt=""
                    width={48}
                    height={48}
                    loading="lazy"
                    className="size-12 rounded-full object-cover"
                  />
                ) : (
                  <span
                    aria-hidden
                    className="bg-accent-soft inline-flex size-12 items-center justify-center rounded-full text-sm font-semibold text-accent"
                  >
                    {initials(t.name)}
                  </span>
                )}
                <span>
                  <span className="text-fg block font-medium">{t.name}</span>
                  {t.role && (
                    <span className="block text-sm text-muted">{t.role}</span>
                  )}
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Section>
  )
}

export const TestimonialsBlock = defineBlock({
  type: "testimonials",
  label: "Testimonials",
  category: "content",
  icon: "Quote",
  description: "Customer quotes with name, role and photo",
  defaultProps: {
    eyebrow: "What clients say",
    heading: "Teams that moved faster",
    items: DEFAULT_QUOTES,
  },
  propsSchema: testimonialsSchema,
  summary: { field: "items", noun: "testimonial" },
  markdown: (p, { md }) =>
    [
      p.heading && md.heading(2, p.heading),
      ...p.items.map(
        (t) =>
          `> ${md.escape(t.quote)}\n>\n> — ${md.escape(t.name)}${t.role ? `, ${md.escape(t.role)}` : ""}`
      ),
    ]
      .filter(Boolean)
      .join("\n\n"),
  component: Testimonials,
})
