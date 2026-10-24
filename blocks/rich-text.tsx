import { defineBlock } from "@glokki-cms/sdk"
import { z } from "zod"

import { Section } from "@/components/ui/section"

const DEFAULT_CONTENT =
  "<h2>Our story</h2><p>Tell visitors who you are, what you do and why it matters.</p>"

export const richTextSchema = z.object({
  content: z
    .string()
    .default(DEFAULT_CONTENT)
    .meta({ fieldType: "richtext" })
    .describe("Content"),
})

function RichText({ content }: z.infer<typeof richTextSchema>) {
  return (
    <Section width="narrow">
      <div
        className="prose-theme prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </Section>
  )
}

export const RichTextBlock = defineBlock({
  type: "rich-text",
  label: "Rich text",
  category: "content",
  icon: "Type",
  description: "Formatted text: headings, paragraphs, lists, links",
  defaultProps: { content: DEFAULT_CONTENT },
  propsSchema: richTextSchema,
  component: RichText,
})
