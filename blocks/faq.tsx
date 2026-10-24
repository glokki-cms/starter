import { JsonLd } from "@glokki-cms/react"
import { defineBlock } from "@glokki-cms/sdk"
import { z } from "zod"

import { Section } from "@/components/ui/section"
import { SectionHeading } from "@/components/ui/section-heading"

const item = z.object({
  question: z.string().min(1).max(200).describe("Question"),
  answer: z
    .string()
    .min(1)
    .max(2000)
    .meta({ fieldType: "textarea" })
    .describe("Answer"),
})
const DEFAULT_ITEMS = [
  {
    question: "How long does it take to launch?",
    answer:
      "Most sites go live within a week: we start from proven sections and adapt them to your content.",
  },
  {
    question: "Can we edit the site ourselves?",
    answer:
      "Yes. Every page is edited visually in the browser, and changes go live when you publish.",
  },
  {
    question: "Is the site multilingual?",
    answer:
      "Yes. Each page can be translated, and visitors get the right language automatically.",
  },
]
export const faqSchema = z.object({
  heading: z.string().max(120).optional().describe("Heading"),
  description: z
    .string()
    .max(400)
    .optional()
    .meta({ fieldType: "textarea" })
    .describe("Description"),
  items: z
    .array(item)
    .default(DEFAULT_ITEMS)
    .meta({ fieldType: "repeater" })
    .describe("Questions"),
})

function Faq({ heading, description, items = [] }: z.infer<typeof faqSchema>) {
  return (
    <Section width="narrow">
      <SectionHeading title={heading} description={description} />
      <div className="divide-line border-line divide-y border-y">
        {items.map((it, i) => (
          <details key={`${it.question}-${i}`} className="group py-5">
            <summary className="text-fg flex cursor-pointer list-none items-center justify-between gap-6 font-medium">
              {it.question}
              <span
                aria-hidden
                className="text-accent transition group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-3 text-muted">{it.answer}</p>
          </details>
        ))}
      </div>
      {items.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: items.map((it) => ({
              "@type": "Question",
              name: it.question,
              acceptedAnswer: { "@type": "Answer", text: it.answer },
            })),
          }}
        />
      )}
    </Section>
  )
}

export const FaqBlock = defineBlock({
  type: "faq",
  label: "FAQ",
  category: "content",
  icon: "CircleHelp",
  description: "Expandable questions and answers, with FAQPage structured data",
  defaultProps: { heading: "Frequently asked questions", items: DEFAULT_ITEMS },
  propsSchema: faqSchema,
  summary: { field: "items", noun: "question" },
  markdown: (p, { md }) =>
    [
      p.heading && md.heading(2, p.heading),
      p.description && md.escape(p.description),
      ...p.items.map(
        (it) => `${md.heading(3, it.question)}\n\n${md.escape(it.answer)}`
      ),
    ]
      .filter(Boolean)
      .join("\n\n"),
  component: Faq,
})
