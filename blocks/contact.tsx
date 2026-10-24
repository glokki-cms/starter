import { defineBlock } from "@glokki-cms/sdk"
import { Mail, MapPin, Phone } from "lucide-react"
import { z } from "zod"

import { FormCard } from "@/components/ui/form-card"
import { Section } from "@/components/ui/section"
import { SectionHeading } from "@/components/ui/section-heading"

import { ContactForm } from "./contact-form"
import { ContactSetupHint } from "./contact-setup-hint"

export const contactSchema = z.object({
  heading: z.string().max(120).optional().describe("Heading"),
  description: z
    .string()
    .max(400)
    .optional()
    .meta({ fieldType: "textarea" })
    .describe("Description"),
  formId: z.string().default("").describe("Form ID (Forms → copy ID)"),
  submitLabel: z.string().max(40).optional().describe("Submit button label"),
  email: z.string().max(120).optional().describe("Email"),
  phone: z.string().max(40).optional().describe("Phone"),
  address: z
    .string()
    .max(300)
    .optional()
    .meta({ fieldType: "textarea" })
    .describe("Address"),
})

function Contact(p: z.infer<typeof contactSchema>) {
  return (
    <Section>
      <div className="grid gap-12 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <SectionHeading
            title={p.heading}
            description={p.description}
            align="left"
          />
          <ul className="text-fg space-y-4">
            {p.email && (
              <li className="flex items-center gap-3">
                <Mail aria-hidden className="size-5 text-accent" />
                <a href={`mailto:${p.email}`} className="hover:text-accent">
                  {p.email}
                </a>
              </li>
            )}
            {p.phone && (
              <li className="flex items-center gap-3">
                <Phone aria-hidden className="size-5 text-accent" />
                <a
                  href={`tel:${p.phone.replace(/[^+\d]/g, "")}`}
                  className="hover:text-accent"
                >
                  {p.phone}
                </a>
              </li>
            )}
            {p.address && (
              <li className="flex items-start gap-3">
                <MapPin aria-hidden className="mt-0.5 size-5 text-accent" />
                <span className="whitespace-pre-line">{p.address}</span>
              </li>
            )}
          </ul>
        </div>
        {p.formId ? (
          <FormCard>
            <ContactForm formId={p.formId} submitLabel={p.submitLabel} />
          </FormCard>
        ) : (
          // Editor-only; visitors just see the contact details.
          <ContactSetupHint />
        )}
      </div>
    </Section>
  )
}

export const ContactBlock = defineBlock({
  type: "contact",
  label: "Contact",
  category: "conversion",
  icon: "Mail",
  description: "Contact details next to a glökki form",
  defaultProps: {
    heading: "Let’s talk",
    description:
      "Send us a message and we’ll get back to you within one business day.",
    formId: "",
    email: "hello@example.com",
  },
  propsSchema: contactSchema,
  markdown: (p, { md }) =>
    [
      p.heading && md.heading(2, p.heading),
      p.description && md.escape(p.description),
      md.list([
        p.email ? md.link(p.email, `mailto:${p.email}`) : "",
        p.phone ? md.escape(p.phone) : "",
        p.address ? md.escape(p.address) : "",
      ]),
    ]
      .filter(Boolean)
      .join("\n\n"),
  component: Contact,
})
