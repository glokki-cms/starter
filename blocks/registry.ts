import { createBlockRegistry } from "@glokki-cms/sdk"
import type { ComponentType } from "react"
import type { ZodType } from "zod"

import { ContactBlock, contactSchema } from "./contact"
import { CtaBlock, ctaSchema } from "./cta"
import { FaqBlock, faqSchema } from "./faq"
import { FeaturesGridBlock, featuresGridSchema } from "./features-grid"
import { HeroBlock, heroSchema } from "./hero"
import { ImageBlock, imageSchema } from "./image"
import { LogoCloudBlock, logoCloudSchema } from "./logo-cloud"
import { MediaTextBlock, mediaTextSchema } from "./media-text"
import { RichTextBlock, richTextSchema } from "./rich-text"
import { TestimonialsBlock, testimonialsSchema } from "./testimonials"

export const BLOCK_CATEGORIES = [
  { key: "sections", label: "Sections" },
  { key: "content", label: "Content" },
  { key: "media", label: "Media" },
  { key: "conversion", label: "Conversion" },
]

export const blockRegistry = createBlockRegistry(
  [
    HeroBlock,
    RichTextBlock,
    FeaturesGridBlock,
    MediaTextBlock,
    ImageBlock,
    LogoCloudBlock,
    TestimonialsBlock,
    FaqBlock,
    CtaBlock,
    ContactBlock,
  ],
  { categories: BLOCK_CATEGORIES }
)

// The SDK registry does not expose Zod schemas (only serialized fields), so
// the starter keeps them here for tests and server-side validation.
export const blockSchemas: Record<string, ZodType> = {
  hero: heroSchema,
  "rich-text": richTextSchema,
  "features-grid": featuresGridSchema,
  "media-text": mediaTextSchema,
  image: imageSchema,
  "logo-cloud": logoCloudSchema,
  testimonials: testimonialsSchema,
  faq: faqSchema,
  cta: ctaSchema,
  contact: contactSchema,
}

export const registry: Map<
  string,
  ComponentType<Record<string, unknown>>
> = new Map(
  blockRegistry
    .getTypes()
    .map((type) => [
      type,
      blockRegistry.getComponent(type) as ComponentType<
        Record<string, unknown>
      >,
    ])
)
