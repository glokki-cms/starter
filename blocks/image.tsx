import { CdnImage } from "@glokki-cms/react"
import { defineBlock } from "@glokki-cms/sdk"
import { z } from "zod"

import { Section } from "@/components/ui/section"

export const imageSchema = z.object({
  image: z.string().optional().meta({ fieldType: "image" }).describe("Image"),
  alt: z.string().max(200).default("").describe("Alt text"),
  caption: z.string().max(200).optional().describe("Caption"),
  width: z
    .enum(["narrow", "default", "wide"])
    .default("default")
    .describe("Width"),
})

function ImageBlockComponent({
  image,
  alt,
  caption,
  width,
}: z.infer<typeof imageSchema>) {
  return (
    <Section width={width}>
      <figure>
        {image ? (
          <CdnImage
            src={image}
            alt={alt}
            width={1600}
            height={1000}
            loading="lazy"
            className="rounded-theme-lg border-line h-auto w-full border"
          />
        ) : (
          <div className="rounded-theme-lg border-line bg-surface flex aspect-[16/9] items-center justify-center border border-dashed text-sm text-muted">
            Choose an image
          </div>
        )}
        {caption && (
          <figcaption className="mt-3 text-center text-sm text-muted">
            {caption}
          </figcaption>
        )}
      </figure>
    </Section>
  )
}

export const ImageBlock = defineBlock({
  type: "image",
  label: "Image",
  category: "media",
  icon: "Image",
  description: "A single image with alt text and an optional caption",
  defaultProps: { alt: "", width: "default" },
  propsSchema: imageSchema,
  markdown: (p, { md }) =>
    p.image
      ? [md.image(p.alt, p.image), p.caption && md.escape(p.caption)]
          .filter(Boolean)
          .join("\n\n")
      : "",
  component: ImageBlockComponent,
})
