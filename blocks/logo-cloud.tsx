import { CdnImage } from "@glokki-cms/react"
import { defineBlock } from "@glokki-cms/sdk"
import { z } from "zod"

import { Section } from "@/components/ui/section"

const logo = z.object({
  image: z.string().optional().meta({ fieldType: "image" }).describe("Logo"),
  name: z.string().min(1).max(60).describe("Company name"),
  href: z.string().optional().describe("Link"),
})
const DEFAULT_LOGOS = [
  { name: "Northwind" },
  { name: "Atelier" },
  { name: "Signal" },
  { name: "Fjord" },
  { name: "Kestrel" },
]
export const logoCloudSchema = z.object({
  heading: z.string().max(120).optional().describe("Heading"),
  logos: z
    .array(logo)
    .default(DEFAULT_LOGOS)
    .meta({ fieldType: "repeater" })
    .describe("Logos"),
})

function LogoCloud({ heading, logos = [] }: z.infer<typeof logoCloudSchema>) {
  return (
    <Section className="py-12 sm:py-16">
      {heading && (
        <p className="mb-8 text-center text-sm font-medium text-muted">
          {heading}
        </p>
      )}
      <ul className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
        {logos.map((l, i) => {
          const mark = l.image ? (
            <CdnImage
              src={l.image}
              alt={l.name}
              width={160}
              height={48}
              loading="lazy"
              className="h-8 w-auto opacity-80 grayscale transition hover:opacity-100 hover:grayscale-0"
            />
          ) : (
            <span className="heading text-xl text-muted">{l.name}</span>
          )
          return (
            <li key={`${l.name}-${i}`}>
              {l.href ? (
                <a href={l.href} aria-label={l.name}>
                  {mark}
                </a>
              ) : (
                mark
              )}
            </li>
          )
        })}
      </ul>
    </Section>
  )
}

export const LogoCloudBlock = defineBlock({
  type: "logo-cloud",
  label: "Logo cloud",
  category: "media",
  icon: "Building2",
  description: "Row of client or partner logos",
  defaultProps: { heading: "Trusted by teams at", logos: DEFAULT_LOGOS },
  propsSchema: logoCloudSchema,
  summary: { field: "logos", noun: "logo" },
  component: LogoCloud,
})
