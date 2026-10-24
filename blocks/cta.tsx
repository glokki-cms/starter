import { defineBlock } from "@glokki-cms/sdk"
import { z } from "zod"

import { ButtonLink } from "@/components/ui/button"
import { Section } from "@/components/ui/section"
import { cn } from "@/lib/utils"

export const ctaSchema = z.object({
  heading: z
    .string()
    .min(1)
    .max(120)
    .default("Ready to start?")
    .describe("Heading"),
  text: z
    .string()
    .max(300)
    .optional()
    .meta({ fieldType: "textarea" })
    .describe("Text"),
  buttonLabel: z
    .string()
    .max(40)
    .default("Contact us")
    .describe("Button label"),
  buttonHref: z.string().default("/contact").describe("Button link"),
  variant: z.enum(["accent", "subtle"]).default("accent").describe("Style"),
})

function Cta({
  heading,
  text,
  buttonLabel,
  buttonHref,
  variant,
}: z.infer<typeof ctaSchema>) {
  const accent = variant === "accent"
  return (
    <Section>
      <div
        className={cn(
          "rounded-theme-lg px-8 py-14 text-center sm:px-16",
          accent ? "text-on-accent bg-accent" : "border-line bg-surface border"
        )}
      >
        <h2
          className={cn("heading text-3xl sm:text-4xl", !accent && "text-fg")}
        >
          {heading}
        </h2>
        {text && (
          <p
            className={cn(
              "mx-auto mt-4 max-w-xl text-lg",
              accent ? "opacity-90" : "text-muted"
            )}
          >
            {text}
          </p>
        )}
        {buttonLabel && (
          <ButtonLink
            href={buttonHref}
            size="lg"
            variant={accent ? "secondary" : "primary"}
            className={cn(
              "mt-8",
              accent &&
                "border-on-accent text-on-accent hover:bg-on-accent hover:text-accent"
            )}
          >
            {buttonLabel}
          </ButtonLink>
        )}
      </div>
    </Section>
  )
}

export const CtaBlock = defineBlock({
  type: "cta",
  label: "Call to action",
  category: "conversion",
  icon: "MousePointerClick",
  description: "A focused banner with one button",
  defaultProps: {
    heading: "Ready to start?",
    text: "Tell us about your project — we reply within one business day.",
    buttonLabel: "Contact us",
    buttonHref: "/contact",
    variant: "accent",
  },
  propsSchema: ctaSchema,
  markdown: (p, { md }) =>
    [
      md.heading(2, p.heading),
      p.text && md.escape(p.text),
      p.buttonLabel && md.link(p.buttonLabel, p.buttonHref),
    ]
      .filter(Boolean)
      .join("\n\n"),
  component: Cta,
})
