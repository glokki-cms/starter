import { defineLayout } from "@glokki-cms/sdk"
import { z } from "zod"

export const Empty = defineLayout({
  key: "empty",
  label: "Empty (no header/footer)",
  headerSchema: z.object({}).strict(),
  footerSchema: z.object({}).strict(),
  Header: () => null,
  Footer: () => null,
})
