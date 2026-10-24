import { CdnImage } from "@glokki-cms/react"
import { defineBlock } from "@glokki-cms/sdk"
import { z } from "zod"

import { ButtonLink } from "@/components/ui/button"
import { Section } from "@/components/ui/section"
import { cn } from "@/lib/utils"

export const mediaTextSchema = z.object({
  eyebrow: z.string().max(60).optional().describe("Eyebrow"),
  heading: z
    .string()
    .min(1)
    .max(120)
    .default("Built around how your team works")
    .describe("Heading"),
  body: z
    .string()
    .default(
      "<p>Explain one idea in depth, next to an image that shows it.</p>"
    )
    .meta({ fieldType: "richtext" })
    .describe("Text"),
  image: z.string().optional().meta({ fieldType: "image" }).describe("Image"),
  imageAlt: z.string().max(200).default("").describe("Image alt text"),
  imageSide: z.enum(["left", "right"]).default("right").describe("Image side"),
  linkLabel: z.string().max(40).optional().describe("Link label"),
  linkHref: z.string().default("/contact").describe("Link"),
})

function MediaText(p: z.infer<typeof mediaTextSchema>) {
  return (
    <Section>
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className={cn(p.imageSide === "left" && "lg:order-2")}>
          {p.eyebrow && (
            <p className="text-xs font-semibold tracking-[0.12em] text-accent uppercase">
              {p.eyebrow}
            </p>
          )}
          <h2 className="heading text-fg mt-3 text-3xl sm:text-4xl">
            {p.heading}
          </h2>
          <div
            className="prose-theme prose mt-6"
            dangerouslySetInnerHTML={{ __html: p.body }}
          />
          {p.linkLabel && (
            <ButtonLink href={p.linkHref} variant="secondary" className="mt-8">
              {p.linkLabel}
            </ButtonLink>
          )}
        </div>
        <div
          className={cn(
            "rounded-theme-lg border-line bg-surface overflow-hidden border",
            p.imageSide === "left" && "lg:order-1"
          )}
        >
          {p.image ? (
            <CdnImage
              src={p.image}
              alt={p.imageAlt}
              width={1200}
              height={900}
              loading="lazy"
              className="h-auto w-full"
            />
          ) : (
            <div aria-hidden className="bg-accent-soft aspect-[4/3]" />
          )}
        </div>
      </div>
    </Section>
  )
}

export const MediaTextBlock = defineBlock({
  type: "media-text",
  label: "Media + text",
  category: "sections",
  icon: "PanelLeft",
  description: "Text beside an image, image on either side",
  defaultProps: {
    heading: "Built around how your team works",
    body: "<p>Explain one idea in depth, next to an image that shows it.</p>",
    imageAlt: "",
    imageSide: "right",
    linkHref: "/contact",
  },
  propsSchema: mediaTextSchema,
  component: MediaText,
})
