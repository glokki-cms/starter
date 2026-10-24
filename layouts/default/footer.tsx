import { z } from "zod"

const link = z.object({
  label: z.string().default("").describe("Label"),
  href: z.string().default("").describe("Link"),
})
const column = z.object({
  title: z.string().max(60).default("").describe("Title"),
  links: z
    .array(link)
    .default([])
    .meta({ fieldType: "repeater" })
    .describe("Links"),
})

export const footerSchema = z.object({
  tagline: z
    .string()
    .max(200)
    .optional()
    .meta({ fieldType: "textarea" })
    .describe("Tagline"),
  columns: z
    .array(column)
    .max(4)
    .default([])
    .meta({ fieldType: "repeater" })
    .describe("Link columns"),
  legal: z
    .string()
    .max(200)
    .default("")
    .describe("Legal line (e.g. © 2026 Company)"),
})
export type FooterData = z.infer<typeof footerSchema>

export function Footer({ data }: { data: FooterData }) {
  return (
    <footer className="border-line bg-surface mt-16 border-t">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[2fr_repeat(4,1fr)]">
        <div>
          {data.tagline && (
            <p className="max-w-xs text-sm text-muted">{data.tagline}</p>
          )}
        </div>
        {data.columns.map((col, i) => (
          <div key={`${col.title}-${i}`}>
            <h2 className="text-fg text-sm font-semibold">{col.title}</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {col.links.map((l, j) => (
                <li key={`${l.href}-${j}`}>
                  <a href={l.href} className="hover:text-fg text-muted">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {data.legal && (
        <div className="border-line border-t px-6 py-6 text-center text-xs text-muted">
          {data.legal}
        </div>
      )}
    </footer>
  )
}
