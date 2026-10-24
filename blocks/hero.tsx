import { defineBlock } from "@glokki-cms/sdk"
import { z } from "zod"

import { ButtonLink } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const heroSchema = z.object({
  eyebrow: z.string().max(60).optional().describe("Eyebrow"),
  heading: z
    .string()
    .min(1)
    .max(120)
    .default("Websites your team can edit without breaking")
    .describe("Heading"),
  subheading: z
    .string()
    .max(280)
    .optional()
    .meta({ fieldType: "textarea" })
    .describe("Subheading"),
  primaryLabel: z.string().max(40).optional().describe("Primary button label"),
  primaryHref: z.string().default("/contact").describe("Primary button link"),
  secondaryLabel: z
    .string()
    .max(40)
    .optional()
    .describe("Secondary button label"),
  secondaryHref: z.string().default("/about").describe("Secondary button link"),
  image: z.string().optional().meta({ fieldType: "image" }).describe("Image"),
  imageAlt: z.string().max(200).default("").describe("Image alt text"),
  layout: z.enum(["centered", "split"]).default("centered").describe("Layout"),
})
type HeroProps = z.infer<typeof heroSchema>

function Hero(p: HeroProps) {
  const split = p.layout === "split" && p.image
  return (
    <section className="px-6 pt-20 pb-16 sm:px-8 sm:pt-28 sm:pb-24">
      <div
        className={cn(
          "mx-auto max-w-6xl",
          split ? "grid items-center gap-12 lg:grid-cols-2" : "text-center"
        )}
      >
        <div className={cn(!split && "mx-auto max-w-3xl")}>
          {p.eyebrow && (
            <p className="text-xs font-semibold tracking-[0.12em] text-accent uppercase">
              {p.eyebrow}
            </p>
          )}
          <h1 className="heading text-fg mt-4 text-4xl sm:text-5xl lg:text-6xl">
            {p.heading}
          </h1>
          {p.subheading && (
            <p className="mt-6 text-lg text-muted">{p.subheading}</p>
          )}
          {(p.primaryLabel || p.secondaryLabel) && (
            <div
              className={cn(
                "mt-10 flex flex-col gap-3 sm:flex-row",
                !split && "justify-center"
              )}
            >
              {p.primaryLabel && (
                <ButtonLink href={p.primaryHref} size="lg">
                  {p.primaryLabel}
                </ButtonLink>
              )}
              {p.secondaryLabel && (
                <ButtonLink
                  href={p.secondaryHref}
                  size="lg"
                  variant="secondary"
                >
                  {p.secondaryLabel}
                </ButtonLink>
              )}
            </div>
          )}
        </div>
        {p.image && (
          <div
            className={cn(
              "rounded-theme-lg border-line overflow-hidden border",
              !split && "mx-auto mt-16 max-w-5xl"
            )}
          >
            {/* LCP candidate: eager + high priority. CdnImage does not forward fetchPriority, so a plain img is used. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.image}
              alt={p.imageAlt}
              width={1600}
              height={1000}
              loading="eager"
              fetchPriority="high"
              className="h-auto w-full"
            />
          </div>
        )}
      </div>
    </section>
  )
}

export const HeroBlock = defineBlock({
  type: "hero",
  label: "Hero",
  category: "sections",
  icon: "Sparkles",
  description: "Page opener with heading, two buttons and an optional image",
  defaultProps: {
    eyebrow: "Welcome",
    heading: "Websites your team can edit without breaking",
    subheading:
      "Fast pages, a visual editor and content in every language you need — on your own domain and code.",
    primaryLabel: "Get in touch",
    primaryHref: "/contact",
    secondaryLabel: "About us",
    secondaryHref: "/about",
    imageAlt: "",
    layout: "centered",
  },
  propsSchema: heroSchema,
  markdown: (props, { md }) =>
    [
      md.heading(1, props.heading),
      props.subheading && md.escape(props.subheading),
      md.list([
        props.primaryLabel
          ? md.link(props.primaryLabel, props.primaryHref)
          : "",
        props.secondaryLabel
          ? md.link(props.secondaryLabel, props.secondaryHref)
          : "",
      ]),
    ]
      .filter(Boolean)
      .join("\n\n"),
  component: Hero,
})
